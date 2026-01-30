import { useState, useEffect } from 'react';
import { bookingApi, hotelApi } from '@/lib/api';

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalBookings: 0,
    activeBookings: 0,
    revenue: 0,
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [hotelsRes, bookingsRes, dashboardStats] = await Promise.all([
          hotelApi.getHotels(1, 1),
          bookingApi.getBookings(1, 1, 'Confirmed'),
          bookingApi.getDashboardStats()
        ]);

        setStats({
          totalHotels: hotelsRes.totalItems || 0,
          activeBookings: bookingsRes.items?.length || 0,
          totalBookings: dashboardStats.totalBookings || 0,
          revenue: dashboardStats.revenue || 0,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Error cargando estadísticas',
        }));
      }
    }

    loadStats();
  }, []);

  return stats;
}