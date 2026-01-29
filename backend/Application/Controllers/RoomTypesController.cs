using Altairis.Backend.Application.DTO;
using Altairis.Backend.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Backend.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomTypesController : ControllerBase
    {
        private readonly IRoomTypeService _roomTypeService;

        public RoomTypesController(IRoomTypeService roomTypeService)
        {
            _roomTypeService = roomTypeService;
        }

        [HttpGet("hotel/{hotelId}")]
        public async Task<ActionResult<List<RoomTypeDto>>> GetByHotel(int hotelId)
        {
            var roomTypes = await _roomTypeService.GetRoomTypesByHotelAsync(hotelId);
            return Ok(roomTypes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoomTypeDto>> Get(int id)
        {
            var roomType = await _roomTypeService.GetRoomTypeAsync(id);
            if (roomType == null) return NotFound();
            return Ok(roomType);
        }

        [HttpPost]
        public async Task<ActionResult<RoomTypeDto>> Create(CreateRoomTypeDto dto)
        {
            var roomType = await _roomTypeService.CreateRoomTypeAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = roomType!.Id }, roomType);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, UpdateRoomTypeDto dto)
        {
            await _roomTypeService.UpdateRoomTypeAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _roomTypeService.DeleteRoomTypeAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
