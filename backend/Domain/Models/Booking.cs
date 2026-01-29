using System.ComponentModel.DataAnnotations;

namespace Altairis.Backend.Domain.Models
{
    public class Booking
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string BookingNumber { get; set; } = string.Empty;

        [Required]
        public int HotelId { get; set; }

        [Required]
        [MaxLength(200)]
        public string CustomerName { get; set; } = string.Empty;

        [EmailAddress]
        [MaxLength(100)]
        public string CustomerEmail { get; set; } = string.Empty;

        [MaxLength(20)]
        public string CustomerPhone { get; set; } = string.Empty;

        [Required]
        public DateOnly CheckInDate { get; set; }

        [Required]
        public DateOnly CheckOutDate { get; set; }

        [Range(1, 100)]
        public int NumberOfGuests { get; set; } = 1;

        [Range(0, 1000000)]
        public decimal TotalAmount { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, CheckedIn, CheckedOut

        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Hotel Hotel { get; set; } = null!;
        public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
    }
}
