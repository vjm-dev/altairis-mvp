using Altairis.Backend.Application.DTO;
using Altairis.Backend.Domain.Models;
using Altairis.Backend.Infra.Data;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Backend.Application.Services
{
    public interface IInventoryService
    {
        Task<List<InventoryDto>> GetInventoryAsync(int roomTypeId, DateOnly startDate, DateOnly endDate);
        Task<List<InventoryDto>> GetHotelInventoryAsync(int hotelId, DateOnly date);
        Task<InventoryDto> UpdateInventoryAsync(int id, UpdateInventoryDto dto);
        Task BulkUpdateInventoryAsync(BulkInventoryUpdateDto dto);
        Task<Dictionary<string, decimal>> GetOccupancyStatsAsync(int hotelId, DateOnly startDate, DateOnly endDate);
    }

    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public InventoryService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<InventoryDto>> GetInventoryAsync(int roomTypeId, DateOnly startDate, DateOnly endDate)
        {
            var inventories = await _context.Inventories
                .Where(i => i.RoomTypeId == roomTypeId && i.Date >= startDate && i.Date <= endDate)
                .Include(i => i.RoomType)
                .OrderBy(i => i.Date)
                .ToListAsync();

            return _mapper.Map<List<InventoryDto>>(inventories);
        }

        public async Task<List<InventoryDto>> GetHotelInventoryAsync(int hotelId, DateOnly date)
        {
            var inventories = await _context.Inventories
                .Where(i => i.Date == date && i.RoomType.HotelId == hotelId)
                .Include(i => i.RoomType)
                .OrderBy(i => i.RoomType.Name)
                .ToListAsync();

            return _mapper.Map<List<InventoryDto>>(inventories);
        }

        public async Task<InventoryDto> UpdateInventoryAsync(int id, UpdateInventoryDto dto)
        {
            var inventory = await _context.Inventories
                .Include(i => i.RoomType)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inventory == null)
                throw new KeyNotFoundException($"Inventory with id {id} not found");

            if (dto.TotalRooms < inventory.ReservedRooms)
                throw new InvalidOperationException($"Total rooms cannot be less than reserved rooms ({inventory.ReservedRooms})");

            inventory.TotalRooms = dto.TotalRooms;
            inventory.Price = dto.Price;
            inventory.IsAvailable = dto.IsAvailable;
            inventory.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return _mapper.Map<InventoryDto>(inventory);
        }

        public async Task BulkUpdateInventoryAsync(BulkInventoryUpdateDto dto)
        {
            var roomTypeExists = await _context.RoomTypes.AnyAsync(rt => rt.Id == dto.RoomTypeId);
            if (!roomTypeExists)
                throw new ArgumentException($"Room type with id {dto.RoomTypeId} not found");

            var existingInventories = await _context.Inventories
                .Where(i => i.RoomTypeId == dto.RoomTypeId &&
                           i.Date >= dto.StartDate &&
                           i.Date <= dto.EndDate)
                .ToListAsync();

            var inventoriesToUpdate = new List<Inventory>();

            for (var date = dto.StartDate; date <= dto.EndDate; date = date.AddDays(1))
            {
                var existing = existingInventories.FirstOrDefault(i => i.Date == date);

                if (existing != null)
                {
                    if (dto.InventoryData.TotalRooms < existing.ReservedRooms)
                        throw new InvalidOperationException($"Cannot reduce total rooms below reserved rooms for date {date}");

                    existing.TotalRooms = dto.InventoryData.TotalRooms;
                    existing.Price = dto.InventoryData.Price;
                    existing.IsAvailable = dto.InventoryData.IsAvailable;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    var inventory = new Inventory
                    {
                        RoomTypeId = dto.RoomTypeId,
                        Date = date,
                        TotalRooms = dto.InventoryData.TotalRooms,
                        ReservedRooms = 0,
                        Price = dto.InventoryData.Price,
                        IsAvailable = dto.InventoryData.IsAvailable,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Inventories.Add(inventory);
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<Dictionary<string, decimal>> GetOccupancyStatsAsync(int hotelId, DateOnly startDate, DateOnly endDate)
        {
            var stats = await _context.Inventories
                .Where(i => i.RoomType.HotelId == hotelId &&
                           i.Date >= startDate &&
                           i.Date <= endDate)
                .GroupBy(i => i.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    TotalRooms = g.Sum(i => i.TotalRooms),
                    ReservedRooms = g.Sum(i => i.ReservedRooms),
                    OccupancyRate = g.Sum(i => i.TotalRooms) > 0 ?
                        g.Sum(i => i.ReservedRooms) * 100m / g.Sum(i => i.TotalRooms) : 0
                })
                .ToListAsync();

            return stats.ToDictionary(
                s => s.Date.ToString("yyyy-MM-dd"),
                s => Math.Round(s.OccupancyRate, 2));
        }
    }
}