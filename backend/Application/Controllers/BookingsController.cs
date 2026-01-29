using Altairis.Backend.Application.DTO;
using Altairis.Backend.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Backend.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<BookingDto>>> Get(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] int? hotelId = null,
            [FromQuery] string status = "",
            [FromQuery] DateOnly? fromDate = null,
            [FromQuery] DateOnly? toDate = null)
        {
            var bookings = await _bookingService.GetBookingsAsync(page, pageSize, hotelId, status, fromDate, toDate);
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDetailDto>> Get(int id)
        {
            var booking = await _bookingService.GetBookingAsync(id);
            if (booking == null) return NotFound();
            return Ok(booking);
        }

        [HttpPost]
        public async Task<ActionResult<BookingDto>> Create(CreateBookingDto dto)
        {
            var booking = await _bookingService.CreateBookingAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = booking!.Id }, booking);
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult> UpdateStatus(int id, UpdateBookingStatusDto dto)
        {
            await _bookingService.UpdateBookingStatusAsync(id, dto);
            return NoContent();
        }

        [HttpGet("dashboard/stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            var stats = await _bookingService.GetDashboardStatsAsync();
            return Ok(stats);
        }
    }
}

