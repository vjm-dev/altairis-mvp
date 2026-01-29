using Altairis.Backend.Application.DTO;

namespace Altairis.Backend.Domain.Interfaces
{
    public interface IHotelService
    {
        Task<PagedResult<HotelDto>> GetHotelsAsync(int page, int pageSize, string search, string country, bool? activeOnly);
        Task<HotelDetailDto?> GetHotelAsync(int id);
        Task<HotelDto> CreateHotelAsync(CreateHotelDto dto);
        Task UpdateHotelAsync(int id, UpdateHotelDto dto);
        Task<bool> DeleteHotelAsync(int id);
        Task<IEnumerable<string>> GetCountriesAsync();
    }
}
