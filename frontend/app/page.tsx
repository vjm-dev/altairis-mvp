'use client';

import { useEffect, useState } from 'react';
import { hotelApi, bookingApi } from '@/lib/api';
import SystemStatus from '@/components/system-status';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalHotels: 0,
    activeBookings: 0,
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [hotelsRes, bookingsRes] = await Promise.all([
          hotelApi.getHotels(1, 1),
          bookingApi.getBookings(1, 100, 'Confirmed'),
        ]);
        
        setStats({
          totalHotels: hotelsRes.totalItems || 0,
          activeBookings: bookingsRes.items?.length || 0,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Error cargando datos',
        }));
      }
    }
    
    loadData();
  }, []);

  if (stats.loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-700"></div>
        <p className="mt-2 text-gray-600">Cargando datos del sistema...</p>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-red-700 font-bold">Error de conexión</h2>
        <p className="text-red-600">{stats.error}</p>
        <p className="text-sm text-red-500 mt-2">
          Verifica que el backend esté corriendo en http://localhost:5000
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard operativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Hoteles activos</h3>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-2">
            {stats.totalHotels}
          </p>
          <a 
            href="/hotels" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mt-2 inline-block"
          >
            Ver todos →
          </a>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Reservas activas</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {stats.activeBookings}
          </p>
          <a 
            href="/bookings" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mt-2 inline-block"
          >
            Gestionar →
          </a>
        </div>
      </div>
      
      {/* System status */}
      <SystemStatus />
    </div>
  );
}