using Altairis.Backend.Application.DTO;

namespace Altairis.Backend.Domain.Interfaces
{
    public interface IRoomTypeService
    {
        Task<List<RoomTypeDto>> GetRoomTypesByHotelAsync(int hotelId);
        Task<RoomTypeDto?> GetRoomTypeAsync(int id);
        Task<RoomTypeDto?> CreateRoomTypeAsync(CreateRoomTypeDto dto);
        Task UpdateRoomTypeAsync(int id, UpdateRoomTypeDto dto);
        Task<bool> DeleteRoomTypeAsync(int id);
    }
}
