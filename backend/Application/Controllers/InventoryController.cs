using Altairis.Backend.Application.DTO;
using Altairis.Backend.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Backend.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet("roomtype/{roomTypeId}")]
        public async Task<ActionResult<List<InventoryDto>>> GetByRoomType(
            int roomTypeId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate)
        {
            var inventory = await _inventoryService.GetInventoryAsync(roomTypeId, startDate, endDate);
            return Ok(inventory);
        }

        [HttpGet("hotel/{hotelId}")]
        public async Task<ActionResult<List<InventoryDto>>> GetByHotel(
            int hotelId,
            [FromQuery] DateOnly date)
        {
            var inventory = await _inventoryService.GetHotelInventoryAsync(hotelId, date);
            return Ok(inventory);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<InventoryDto>> Update(int id, UpdateInventoryDto dto)
        {
            var inventory = await _inventoryService.UpdateInventoryAsync(id, dto);
            return Ok(inventory);
        }

        [HttpPost("bulk")]
        public async Task<ActionResult> BulkUpdate(BulkInventoryUpdateDto dto)
        {
            await _inventoryService.BulkUpdateInventoryAsync(dto);
            return NoContent();
        }

        [HttpGet("stats/{hotelId}")]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetStats(
            int hotelId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate)
        {
            var stats = await _inventoryService.GetOccupancyStatsAsync(hotelId, startDate, endDate);
            return Ok(stats);
        }
    }
}
