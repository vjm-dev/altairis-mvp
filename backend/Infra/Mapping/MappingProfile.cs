using Altairis.Backend.Application.DTO;
using Altairis.Backend.Domain.Models;
using AutoMapper;

namespace Altairis.Backend.Infra.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Hotel mappings
            CreateMap<Hotel, HotelDto>();
            CreateMap<Hotel, HotelDetailDto>();
            CreateMap<CreateHotelDto, Hotel>();
            CreateMap<UpdateHotelDto, Hotel>();

            // RoomType mappings
            CreateMap<RoomType, RoomTypeDto>()
                .ForMember(dest => dest.HotelName, opt => opt.MapFrom(src => src.Hotel.Name));
            CreateMap<CreateRoomTypeDto, RoomType>();
            CreateMap<UpdateRoomTypeDto, RoomType>();

            // Inventory mappings
            CreateMap<Inventory, InventoryDto>()
                .ForMember(dest => dest.RoomTypeName, opt => opt.MapFrom(src => src.RoomType.Name));

            // Booking mappings
            CreateMap<Booking, BookingDto>()
                .ForMember(dest => dest.HotelName, opt => opt.MapFrom(src => src.Hotel.Name));
            CreateMap<Booking, BookingDetailDto>()
                .ForMember(dest => dest.HotelName, opt => opt.MapFrom(src => src.Hotel.Name));
            CreateMap<CreateBookingDto, Booking>();
        }
    }
}
