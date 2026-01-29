using Altairis.Backend.Application.DTO;

namespace Altairis.Backend.Domain.Interfaces
{

    public interface IBookingService
    {
        Task<PagedResult<BookingDto>> GetBookingsAsync(int page, int pageSize, int? hotelId, string status, DateOnly? fromDate, DateOnly? toDate);
        Task<BookingDetailDto?> GetBookingAsync(int id);
        Task<BookingDto?> CreateBookingAsync(CreateBookingDto dto);
        Task UpdateBookingStatusAsync(int id, UpdateBookingStatusDto dto);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}
