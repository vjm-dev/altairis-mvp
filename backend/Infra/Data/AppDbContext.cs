using Microsoft.EntityFrameworkCore;
using Altairis.Backend.Domain.Models;

namespace Altairis.Backend.Infra.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingDetail> BookingDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Hotel configuration
            modelBuilder.Entity<Hotel>(entity =>
            {
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.Country);
                entity.HasIndex(e => e.City);
                entity.HasIndex(e => e.IsActive);

                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.City).IsRequired();
                entity.Property(e => e.Country).IsRequired();

                entity.HasMany(e => e.RoomTypes)
                    .WithOne(e => e.Hotel)
                    .HasForeignKey(e => e.HotelId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(e => e.Bookings)
                    .WithOne(e => e.Hotel)
                    .HasForeignKey(e => e.HotelId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // RoomType configuration
            modelBuilder.Entity<RoomType>(entity =>
            {
                entity.HasIndex(e => e.HotelId);
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.IsActive);

                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.BasePrice).HasPrecision(18, 2);

                entity.HasMany(e => e.Inventories)
                    .WithOne(e => e.RoomType)
                    .HasForeignKey(e => e.RoomTypeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(e => e.BookingDetails)
                    .WithOne(e => e.RoomType)
                    .HasForeignKey(e => e.RoomTypeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Inventory configuration
            modelBuilder.Entity<Inventory>(entity =>
            {
                entity.HasIndex(e => new { e.RoomTypeId, e.Date }).IsUnique();
                entity.HasIndex(e => e.Date);

                entity.Property(e => e.Price).HasPrecision(18, 2);
            });

            // Booking configuration
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasIndex(e => e.BookingNumber).IsUnique();
                entity.HasIndex(e => e.HotelId);
                entity.HasIndex(e => e.CheckInDate);
                entity.HasIndex(e => e.CheckOutDate);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CustomerEmail);

                entity.Property(e => e.BookingNumber).IsRequired();
                entity.Property(e => e.CustomerName).IsRequired();
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);

                entity.HasMany(e => e.BookingDetails)
                    .WithOne(e => e.Booking)
                    .HasForeignKey(e => e.BookingId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // BookingDetail configuration
            modelBuilder.Entity<BookingDetail>(entity =>
            {
                entity.Property(e => e.PricePerRoom).HasPrecision(18, 2);
                entity.Property(e => e.Subtotal).HasPrecision(18, 2);
            });
        }
    }
}
