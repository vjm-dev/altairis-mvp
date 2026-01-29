using Altairis.Backend.Application.DTO;
using Altairis.Backend.Domain.Interfaces;
using Altairis.Backend.Domain.Models;
using Altairis.Backend.Infra.Data;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Backend.Application.Services
{
    public class RoomTypeService : IRoomTypeService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public RoomTypeService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<RoomTypeDto>> GetRoomTypesByHotelAsync(int hotelId)
        {
            var roomTypes = await _context.RoomTypes
                .Where(rt => rt.HotelId == hotelId && rt.IsActive)
                .Include(rt => rt.Hotel)
                .Include(rt => rt.Inventories.Where(i => i.Date == DateOnly.FromDateTime(DateTime.UtcNow)))
                .ToListAsync();

            var roomTypeDtos = _mapper.Map<List<RoomTypeDto>>(roomTypes);

            foreach (var dto in roomTypeDtos)
            {
                var roomType = roomTypes.First(rt => rt.Id == dto.Id);
                dto.AvailableRooms = roomType.Inventories.FirstOrDefault()?.AvailableRooms ?? 0;
            }

            return roomTypeDtos;
        }

        public async Task<RoomTypeDto?> GetRoomTypeAsync(int id)
        {
            var roomType = await _context.RoomTypes
                .Include(rt => rt.Hotel)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null) return null;

            return _mapper.Map<RoomTypeDto>(roomType);
        }

        public async Task<RoomTypeDto?> CreateRoomTypeAsync(CreateRoomTypeDto dto)
        {
            var hotelExists = await _context.Hotels.AnyAsync(h => h.Id == dto.HotelId);
            if (!hotelExists)
                throw new ArgumentException($"Hotel with id {dto.HotelId} not found");

            var roomType = _mapper.Map<RoomType>(dto);
            roomType.CreatedAt = DateTime.UtcNow;
            roomType.UpdatedAt = DateTime.UtcNow;

            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();

            // Initialize inventory for next 365 days
            await InitializeInventoryAsync(roomType.Id);

            return await GetRoomTypeAsync(roomType.Id);
        }

        private async Task InitializeInventoryAsync(int roomTypeId)
        {
            var inventories = new List<Inventory>();
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var endDate = startDate.AddDays(365);

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                inventories.Add(new Inventory
                {
                    RoomTypeId = roomTypeId,
                    Date = date,
                    TotalRooms = 10, // Default value
                    ReservedRooms = 0,
                    Price = 100, // Default price
                    IsAvailable = true,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            await _context.Inventories.AddRangeAsync(inventories);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRoomTypeAsync(int id, UpdateRoomTypeDto dto)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);
            if (roomType == null)
                throw new KeyNotFoundException($"Room type with id {id} not found");

            _mapper.Map(dto, roomType);
            roomType.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteRoomTypeAsync(int id)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);
            if (roomType == null) return false;

            // Soft delete
            roomType.IsActive = false;
            roomType.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
