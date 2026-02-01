using Altairis.Backend.Application.DTO;
using Altairis.Backend.Domain.Interfaces;
using Altairis.Backend.Domain.Models;
using Altairis.Backend.Infra.Data;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Backend.Application.Services
{
    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public BookingService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<PagedResult<BookingDto>> GetBookingsAsync(int page, int pageSize, int? hotelId, string status, DateOnly? fromDate, DateOnly? toDate)
        {
            var query = _context.Bookings
                .Include(b => b.Hotel)
                .AsQueryable();

            if (hotelId.HasValue)
            {
                query = query.Where(b => b.HotelId == hotelId.Value);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(b => b.Status == status);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(b => b.CheckInDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(b => b.CheckOutDate <= toDate.Value);
            }

            var totalItems = await query.CountAsync();

            var bookings = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var bookingDtos = _mapper.Map<List<BookingDto>>(bookings);

            return new PagedResult<BookingDto>
            {
                Items = bookingDtos,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<BookingDetailDto?> GetBookingAsync(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Hotel)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return null;

            var bookingDto = _mapper.Map<BookingDetailDto>(booking);

            // Map booking details to items
            bookingDto.Items = booking.BookingDetails.Select(bd => new BookingItemDto
            {
                RoomTypeId = bd.RoomTypeId,
                RoomTypeName = bd.RoomType.Name,
                NumberOfRooms = bd.NumberOfRooms,
                PricePerRoom = bd.PricePerRoom,
                Subtotal = bd.Subtotal
            }).ToList();

            return bookingDto;
        }

        public async Task<BookingDto?> CreateBookingAsync(CreateBookingDto dto)
        {
            // Validate hotel exists
            var hotel = await _context.Hotels.FindAsync(dto.HotelId);
            if (hotel == null)
                throw new ArgumentException($"Hotel with id {dto.HotelId} not found");

            // Validate dates
            if (dto.CheckInDate >= dto.CheckOutDate)
                throw new ArgumentException("Check-in date must be before check-out date");

            var booking = _mapper.Map<Booking>(dto);
            booking.BookingNumber = GenerateBookingNumber();
            booking.CreatedAt = DateTime.UtcNow;
            booking.UpdatedAt = DateTime.UtcNow;
            booking.Status = "Confirmed";

            // Calculate total amount and validate inventory
            var bookingDetails = new List<BookingDetail>();
            decimal totalAmount = 0;

            foreach (var room in dto.Rooms)
            {
                // Get room type and validate
                var roomType = await _context.RoomTypes
                    .FirstOrDefaultAsync(rt => rt.Id == room.RoomTypeId && rt.HotelId == dto.HotelId);

                if (roomType == null)
                    throw new ArgumentException($"Room type with id {room.RoomTypeId} not found in hotel {dto.HotelId}");

                if (!roomType.IsActive)
                    throw new ArgumentException($"Room type {roomType.Name} is not active");

                // Check availability for each night
                for (var date = dto.CheckInDate; date < dto.CheckOutDate; date = date.AddDays(1))
                {
                    var inventory = await _context.Inventories
                        .FirstOrDefaultAsync(i => i.RoomTypeId == room.RoomTypeId && i.Date == date);

                    if (inventory == null || !inventory.IsAvailable)
                        throw new ArgumentException($"No availability for {roomType.Name} on {date}");

                    var availableRooms = inventory.TotalRooms - inventory.ReservedRooms;
                    if (availableRooms < room.NumberOfRooms)
                        throw new ArgumentException($"Not enough rooms available for {roomType.Name} on {date}");
                }

                // Calculate price for the stay
                var nights = dto.CheckOutDate.DayNumber - dto.CheckInDate.DayNumber;
                var firstNightPrice = await _context.Inventories
                    .Where(i => i.RoomTypeId == room.RoomTypeId && i.Date == dto.CheckInDate)
                    .Select(i => i.Price)
                    .FirstOrDefaultAsync();

                var pricePerNight = firstNightPrice > 0 ? firstNightPrice : roomType.BasePrice;
                var subtotal = room.NumberOfRooms * pricePerNight * nights;

                var bookingDetail = new BookingDetail
                {
                    RoomTypeId = room.RoomTypeId,
                    NumberOfRooms = room.NumberOfRooms,
                    PricePerRoom = pricePerNight,
                    Subtotal = subtotal
                };

                bookingDetails.Add(bookingDetail);
                totalAmount += subtotal;

                // Update inventory
                for (var date = dto.CheckInDate; date < dto.CheckOutDate; date = date.AddDays(1))
                {
                    var inventory = await _context.Inventories
                        .FirstAsync(i => i.RoomTypeId == room.RoomTypeId && i.Date == date);

                    inventory.ReservedRooms += room.NumberOfRooms;
                    inventory.UpdatedAt = DateTime.UtcNow;
                }
            }

            booking.TotalAmount = totalAmount;
            booking.BookingDetails = bookingDetails;

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return await GetBookingAsync(booking.Id);
        }

        public async Task UpdateBookingStatusAsync(int id, UpdateBookingStatusDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                throw new KeyNotFoundException($"Booking with id {id} not found");

            var oldStatus = booking.Status;
            booking.Status = dto.Status;
            booking.UpdatedAt = DateTime.UtcNow;

            // If booking is cancelled, release inventory
            if (oldStatus != "Cancelled" && dto.Status == "Cancelled")
            {
                foreach (var detail in booking.BookingDetails)
                {
                    for (var date = booking.CheckInDate; date < booking.CheckOutDate; date = date.AddDays(1))
                    {
                        var inventory = await _context.Inventories
                            .FirstAsync(i => i.RoomTypeId == detail.RoomTypeId && i.Date == date);

                        inventory.ReservedRooms -= detail.NumberOfRooms;
                        inventory.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var totalHotels = await _context.Hotels.CountAsync(h => h.IsActive);
            var totalBookingsToday = await _context.Bookings
                .CountAsync(b => b.CreatedAt.Date == DateTime.UtcNow.Date);

            var activeBookings = await _context.Bookings
                .CountAsync(b => b.Status == "Confirmed" &&
                                b.CheckInDate <= today &&
                                b.CheckOutDate >= today);

            var revenueToday = await _context.Bookings
                .Where(b => b.CreatedAt.Date == DateTime.UtcNow.Date && b.Status != "Cancelled")
                .SumAsync(b => b.TotalAmount);

            var occupancyRate = await CalculateOccupancyRateAsync(today);

            return new DashboardStatsDto
            {
                TotalHotels = totalHotels,
                ActiveBookings = activeBookings,
                BookingsToday = totalBookingsToday,
                RevenueToday = revenueToday,
                OccupancyRate = occupancyRate,
                TopHotels = await GetTopHotelsAsync(5)
            };
        }

        private async Task<decimal> CalculateOccupancyRateAsync(DateOnly date)
        {
            var totalRooms = await _context.Inventories
                .Where(i => i.Date == date)
                .SumAsync(i => i.TotalRooms);

            var reservedRooms = await _context.Inventories
                .Where(i => i.Date == date)
                .SumAsync(i => i.ReservedRooms);

            return totalRooms > 0 ? reservedRooms * 100m / totalRooms : 0;
        }

        private async Task<List<TopHotelDto>> GetTopHotelsAsync(int count)
        {
            var lastMonth = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-1));
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            return await _context.Hotels
                .Where(h => h.IsActive)
                .Select(h => new TopHotelDto
                {
                    Id = h.Id,
                    Name = h.Name,
                    City = h.City,
                    BookingCount = h.Bookings.Count(b =>
                        b.Status != "Cancelled" &&
                        b.CreatedAt.Date >= lastMonth.ToDateTime(TimeOnly.MinValue).Date),
                    Revenue = h.Bookings
                        .Where(b => b.Status != "Cancelled" &&
                                   b.CreatedAt.Date >= lastMonth.ToDateTime(TimeOnly.MinValue).Date)
                        .Sum(b => b.TotalAmount)
                })
                .OrderByDescending(h => h.Revenue)
                .Take(count)
                .ToListAsync();
        }

        private string GenerateBookingNumber()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            return $"ALT{timestamp}{random}";
        }
    }
}
