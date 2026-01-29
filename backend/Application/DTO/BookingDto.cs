using System.ComponentModel.DataAnnotations;

namespace Altairis.Backend.Application.DTO
{
    public class BookingDto
    {
        public int Id { get; set; }
        public string BookingNumber { get; set; } = string.Empty;
        public int HotelId { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
        public int Nights => CheckOutDate.DayNumber - CheckInDate.DayNumber;
        public int NumberOfGuests { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class BookingDetailDto : BookingDto
    {
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public List<BookingItemDto> Items { get; set; } = new();
    }

    public class BookingItemDto
    {
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public int NumberOfRooms { get; set; }
        public decimal PricePerRoom { get; set; }
        public decimal Subtotal { get; set; }
    }

    public class CreateBookingDto
    {
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

        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;

        public List<BookingRoomDto> Rooms { get; set; } = new();
    }

    public class BookingRoomDto
    {
        [Required]
        public int RoomTypeId { get; set; }

        [Range(1, 100)]
        public int NumberOfRooms { get; set; } = 1;
    }

    public class UpdateBookingStatusDto
    {
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty;
    }
}
