using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace Altairis.Backend.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public HealthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult GetHealth()
        {
            var result = new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                services = new
                {
                    database = CheckDatabase()
                }
            };

            return Ok(result);
        }

        [HttpGet("database")]
        public IActionResult GetDatabaseHealth()
        {
            var isConnected = CheckDatabase();
            return Ok(new
            {
                connected = isConnected,
                timestamp = DateTime.UtcNow
            });
        }

        private bool CheckDatabase()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");

            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    using (var command = new SqlCommand("SELECT 1", connection))
                    {
                        var result = command.ExecuteScalar();
                        return result != null && Convert.ToInt32(result) == 1;
                    }
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
