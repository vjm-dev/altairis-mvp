using System.ComponentModel.DataAnnotations;

namespace Altairis.Backend.Application.DTO
{
    public class RoomTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int HotelId { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal BasePrice { get; set; }
        public bool IsActive { get; set; }
        public int AvailableRooms { get; set; }
    }

    public class CreateRoomTypeDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int HotelId { get; set; }

        [Range(1, 10)]
        public int Capacity { get; set; } = 2;

        [Range(0, 10000)]
        public decimal BasePrice { get; set; }
    }

    public class UpdateRoomTypeDto : CreateRoomTypeDto
    {
        public bool IsActive { get; set; } = true;
    }
}