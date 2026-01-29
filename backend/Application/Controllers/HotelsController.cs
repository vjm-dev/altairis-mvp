using Altairis.Backend.Application.DTO;
using Altairis.Backend.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Backend.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase
    {
        private readonly IHotelService _hotelService;

        public HotelsController(IHotelService hotelService)
        {
            _hotelService = hotelService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<HotelDto>>> GetHotels(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string search = "",
            [FromQuery] string country = "",
            [FromQuery] bool? activeOnly = null)
        {
            var result = await _hotelService.GetHotelsAsync(page, pageSize, search, country, activeOnly);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HotelDetailDto>> GetHotel(int id)
        {
            var hotel = await _hotelService.GetHotelAsync(id);
            if (hotel == null) return NotFound();
            return Ok(hotel);
        }

        [HttpPost]
        public async Task<ActionResult<HotelDto>> CreateHotel(CreateHotelDto dto)
        {
            var hotel = await _hotelService.CreateHotelAsync(dto);
            return CreatedAtAction(nameof(GetHotel), new { id = hotel.Id }, hotel);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateHotel(int id, UpdateHotelDto dto)
        {
            await _hotelService.UpdateHotelAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteHotel(int id)
        {
            var result = await _hotelService.DeleteHotelAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpGet("countries")]
        public async Task<ActionResult<IEnumerable<string>>> GetCountries()
        {
            var countries = await _hotelService.GetCountriesAsync();
            return Ok(countries);
        }
    }
}
