using System.ComponentModel.DataAnnotations;

namespace Altairis.Backend.Application.DTO
{
    public class HotelDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int StarRating { get; set; }
        public bool IsActive { get; set; }
        public int RoomTypesCount { get; set; }
        public int ActiveBookingsCount { get; set; }
    }

    public class HotelDetailDto : HotelDto
    {
        public string ChainCode { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<RoomTypeDto> RoomTypes { get; set; } = new();
    }

    public class CreateHotelDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string ChainCode { get; set; } = string.Empty;

        [MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [MaxLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Range(1, 5)]
        public int StarRating { get; set; } = 3;
    }

    public class UpdateHotelDto : CreateHotelDto
    {
        public bool IsActive { get; set; } = true;
    }
}