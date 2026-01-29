using System.ComponentModel.DataAnnotations;

namespace Altairis.Backend.Application.DTO
{
    public class InventoryDto
    {
        public int Id { get; set; }
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
        public int TotalRooms { get; set; }
        public int ReservedRooms { get; set; }
        public int AvailableRooms => TotalRooms - ReservedRooms;
        public decimal Price { get; set; }
        public bool IsAvailable { get; set; }
        public decimal OccupancyPercentage => TotalRooms > 0 ? ReservedRooms * 100m / TotalRooms : 0;
    }

    public class UpdateInventoryDto
    {
        [Range(0, 1000)]
        public int TotalRooms { get; set; }

        [Range(0, 10000)]
        public decimal Price { get; set; }

        public bool IsAvailable { get; set; } = true;
    }

    public class BulkInventoryUpdateDto
    {
        [Required]
        public int RoomTypeId { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        [Required]
        public DateOnly EndDate { get; set; }

        [Required]
        public UpdateInventoryDto InventoryData { get; set; } = new();
    }
}
