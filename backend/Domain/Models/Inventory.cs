using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Altairis.Backend.Domain.Models
{
    public class Inventory
    {
        public int Id { get; set; }

        [Required]
        public int RoomTypeId { get; set; }

        [Required]
        public DateOnly Date { get; set; }

        [Range(0, 1000)]
        public int TotalRooms { get; set; }

        [Range(0, 1000)]
        public int ReservedRooms { get; set; }

        [Range(0, 10000)]
        public decimal Price { get; set; }

        public bool IsAvailable { get; set; } = true;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


        [NotMapped]
        public int AvailableRooms => TotalRooms - ReservedRooms;

        // Navigation properties
        public RoomType RoomType { get; set; } = null!;
    }
}
