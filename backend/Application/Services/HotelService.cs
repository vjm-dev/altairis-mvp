using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Altairis.Backend.Infra.Data;
using Altairis.Backend.Domain.Interfaces;
using Altairis.Backend.Application.DTO;
using Altairis.Backend.Domain.Models;

namespace Altairis.Backend.Application.Services
{
    public class HotelService : IHotelService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public HotelService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<PagedResult<HotelDto>> GetHotelsAsync(int page, int pageSize, string search, string country, bool? activeOnly)
        {
            var query = _context.Hotels.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(h =>
                    h.Name.ToLower().Contains(search) ||
                    h.City.ToLower().Contains(search) ||
                    h.Country.ToLower().Contains(search) ||
                    h.ChainCode.ToLower().Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(country))
            {
                query = query.Where(h => h.Country == country);
            }

            if (activeOnly.HasValue && activeOnly.Value)
            {
                query = query.Where(h => h.IsActive);
            }

            var totalItems = await query.CountAsync();

            var hotels = await query
                .OrderBy(h => h.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(h => h.RoomTypes)
                .ToListAsync();

            var hotelDtos = _mapper.Map<List<HotelDto>>(hotels);

            // Calculate additional properties
            foreach (var hotelDto in hotelDtos)
            {
                var hotel = hotels.First(h => h.Id == hotelDto.Id);
                hotelDto.RoomTypesCount = hotel.RoomTypes.Count(rt => rt.IsActive);

                // Get active bookings
                var activeBookings = await _context.Bookings
                    .Where(b => b.HotelId == hotelDto.Id &&
                               b.Status != "Cancelled" &&
                               b.Status != "CheckedOut" &&
                               b.CheckInDate <= DateOnly.FromDateTime(DateTime.UtcNow) &&
                               b.CheckOutDate >= DateOnly.FromDateTime(DateTime.UtcNow))
                    .CountAsync();

                hotelDto.ActiveBookingsCount = activeBookings;
            }

            return new PagedResult<HotelDto>
            {
                Items = hotelDtos,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<HotelDetailDto?> GetHotelAsync(int id)
        {
            var hotel = await _context.Hotels
                .Include(h => h.RoomTypes.Where(rt => rt.IsActive))
                .FirstOrDefaultAsync(h => h.Id == id);

            if (hotel == null) return null;

            var hotelDto = _mapper.Map<HotelDetailDto>(hotel);
            return hotelDto;
        }

        public async Task<HotelDto> CreateHotelAsync(CreateHotelDto dto)
        {
            var hotel = _mapper.Map<Hotel>(dto);
            hotel.CreatedAt = DateTime.UtcNow;
            hotel.UpdatedAt = DateTime.UtcNow;

            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();

            return _mapper.Map<HotelDto>(hotel);
        }

        public async Task UpdateHotelAsync(int id, UpdateHotelDto dto)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null)
                throw new KeyNotFoundException($"Hotel with id {id} not found");

            _mapper.Map(dto, hotel);
            hotel.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteHotelAsync(int id)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null) return false;

            // Soft delete - mark as inactive
            hotel.IsActive = false;
            hotel.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<string>> GetCountriesAsync()
        {
            return await _context.Hotels
                .Where(h => h.IsActive)
                .Select(h => h.Country)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }
    }
}
