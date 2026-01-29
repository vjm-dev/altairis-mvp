namespace Altairis.Backend.Application.DTO
{
    public class DashboardStatsDto
    {
        public int TotalHotels { get; set; }
        public int ActiveBookings { get; set; }
        public int BookingsToday { get; set; }
        public decimal RevenueToday { get; set; }
        public decimal OccupancyRate { get; set; }
        public List<TopHotelDto> TopHotels { get; set; } = new();
    }
}
