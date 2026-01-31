using Altairis.Backend.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Backend.Infra.Data
{
    public static class SeedData
    {
        public static async Task Initialize(AppDbContext context)
        {
            if (!context.Hotels.Any())
            {
                var hotels = new List<Hotel>
                {
                    new Hotel
                    {
                        Name = "Grand Altairis Madrid",
                        ChainCode = "ALT",
                        Address = "Gran Vía 123",
                        City = "Madrid",
                        Country = "Spain",
                        PostalCode = "28013",
                        Phone = "+34 91 123 4567",
                        Email = "madrid@altairis.com",
                        StarRating = 5,
                        IsActive = true,
                        RoomTypes = new List<RoomType>
                        {
                            new RoomType
                            {
                                Name = "Doble Standard",
                                Description = "Habitación doble con vistas a la ciudad",
                                Capacity = 2,
                                BasePrice = 150.00m,
                                Inventories = GenerateInventory(10, 120.00m, 200.00m)
                            },
                            new RoomType
                            {
                                Name = "Suite Ejecutiva",
                                Description = "Suite de lujo con sala de estar",
                                Capacity = 2,
                                BasePrice = 350.00m,
                                Inventories = GenerateInventory(5, 300.00m, 500.00m)
                            },
                            new RoomType
                            {
                                Name = "Familiar",
                                Description = "Habitación familiar con 2 camas dobles",
                                Capacity = 4,
                                BasePrice = 280.00m,
                                Inventories = GenerateInventory(8, 220.00m, 350.00m)
                            }
                        }
                    },
                    new Hotel
                    {
                        Name = "Altairis Barcelona Beach",
                        ChainCode = "ALT",
                        Address = "Paseo Marítimo 45",
                        City = "Barcelona",
                        Country = "Spain",
                        PostalCode = "08003",
                        Phone = "+34 93 987 6543",
                        Email = "barcelona@altairis.com",
                        StarRating = 4,
                        IsActive = true,
                        RoomTypes = new List<RoomType>
                        {
                            new RoomType
                            {
                                Name = "Doble Vista Mar",
                                Description = "Habitación doble con vistas al mar",
                                Capacity = 2,
                                BasePrice = 180.00m,
                                Inventories = GenerateInventory(12, 150.00m, 220.00m)
                            },
                            new RoomType
                            {
                                Name = "Junior Suite",
                                Description = "Suite junior con terraza privada",
                                Capacity = 2,
                                BasePrice = 320.00m,
                                Inventories = GenerateInventory(6, 280.00m, 400.00m)
                            }
                        }
                    },
                    new Hotel
                    {
                        Name = "Altairis Paris Champs-Élysées",
                        ChainCode = "ALT",
                        Address = "Avenue des Champs-Élysées 89",
                        City = "Paris",
                        Country = "France",
                        PostalCode = "75008",
                        Phone = "+33 1 40 20 50 60",
                        Email = "paris@altairis.com",
                        StarRating = 5,
                        IsActive = true,
                        RoomTypes = new List<RoomType>
                        {
                            new RoomType
                            {
                                Name = "Doble Superior",
                                Description = "Habitación doble con vistas a los Campos Elíseos",
                                Capacity = 2,
                                BasePrice = 400.00m,
                                Inventories = GenerateInventory(8, 350.00m, 500.00m)
                            },
                            new RoomType
                            {
                                Name = "Suite Presidencial",
                                Description = "Suite de lujo con jacuzzi",
                                Capacity = 2,
                                BasePrice = 800.00m,
                                Inventories = GenerateInventory(3, 700.00m, 1000.00m)
                            }
                        }
                    },
                    new Hotel
                    {
                        Name = "Altairis Rome Centro",
                        ChainCode = "ALT",
                        Address = "Via del Corso 156",
                        City = "Rome",
                        Country = "Italy",
                        PostalCode = "00186",
                        Phone = "+39 06 678 9012",
                        Email = "rome@altairis.com",
                        StarRating = 4,
                        IsActive = true,
                        RoomTypes = new List<RoomType>
                        {
                            new RoomType
                            {
                                Name = "Doble Clásica",
                                Description = "Habitación doble con estilo clásico italiano",
                                Capacity = 2,
                                BasePrice = 220.00m,
                                Inventories = GenerateInventory(10, 180.00m, 280.00m)
                            },
                            new RoomType
                            {
                                Name = "Suite Familiar",
                                Description = "Suite familiar para 4 personas",
                                Capacity = 4,
                                BasePrice = 450.00m,
                                Inventories = GenerateInventory(5, 400.00m, 600.00m)
                            }
                        }
                    }
                };

                await context.Hotels.AddRangeAsync(hotels);
                await context.SaveChangesAsync();

                // Create some bookings for demo
                await CreateDemoBookings(context);
            }
        }

        private static List<Inventory> GenerateInventory(int totalRooms, decimal minPrice, decimal maxPrice)
        {
            var inventories = new List<Inventory>();
            var random = new Random();
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var endDate = startDate.AddDays(60);

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                // Randomize availability and price for demo
                var price = Math.Round(minPrice + (maxPrice - minPrice) * (decimal)random.NextDouble(), 2);
                var reserved = random.Next(0, totalRooms / 2); // Random reserved rooms for demo

                inventories.Add(new Inventory
                {
                    Date = date,
                    TotalRooms = totalRooms,
                    ReservedRooms = reserved,
                    Price = price,
                    IsAvailable = true,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            return inventories;
        }

        private static async Task CreateDemoBookings(AppDbContext context)
        {
            var hotels = await context.Hotels.ToListAsync();
            var roomTypes = await context.RoomTypes.ToListAsync();
            var random = new Random();

            var bookings = new List<Booking>();

            for (int i = 0; i < 50; i++)
            {
                var hotel = hotels[random.Next(hotels.Count)];
                var checkIn = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(random.Next(-30, 60)));
                var checkOut = checkIn.AddDays(random.Next(1, 14));

                var booking = new Booking
                {
                    BookingNumber = $"DEMO{DateTime.UtcNow:yyyyMMddHHmmss}{i:000}",
                    HotelId = hotel.Id,
                    CustomerName = $"Customer {i + 1}",
                    CustomerEmail = $"customer{i + 1}@example.com",
                    CustomerPhone = $"+34 600 {random.Next(100000, 999999)}",
                    CheckInDate = checkIn,
                    CheckOutDate = checkOut,
                    NumberOfGuests = random.Next(1, 4),
                    TotalAmount = random.Next(500, 5000),
                    Status = GetRandomStatus(),
                    Notes = i % 5 == 0 ? "Special request: Late check-in required" : "",
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(0, 90)),
                    UpdatedAt = DateTime.UtcNow
                };

                bookings.Add(booking);
            }

            await context.Bookings.AddRangeAsync(bookings);
            await context.SaveChangesAsync();
        }

        private static string GetRandomStatus()
        {
            var statuses = new[] { "Confirmed", "Confirmed", "Confirmed", "Pending", "Cancelled", "CheckedIn", "CheckedOut" };
            var random = new Random();
            return statuses[random.Next(statuses.Length)];
        }
    }
}
