using System.ComponentModel.DataAnnotations;

namespace Altairis.Backend.Domain.Models
{
    public class BookingDetail
    {
        public int Id { get; set; }

        [Required]
        public int BookingId { get; set; }

        [Required]
        public int RoomTypeId { get; set; }

        [Range(1, 100)]
        public int NumberOfRooms { get; set; } = 1;

        [Range(0, 10000)]
        public decimal PricePerRoom { get; set; }

        [Range(0, 1000000)]
        public decimal Subtotal { get; set; }

        // Navigation properties
        public Booking Booking { get; set; } = null!;
        public RoomType RoomType { get; set; } = null!;
    }
}
