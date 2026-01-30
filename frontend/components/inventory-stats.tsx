'use client';

import { useState, useEffect } from 'react';
import { inventoryApi } from '@/lib/api';

interface InventoryStatsProps {
  hotelId: number;
}

export default function InventoryStats({ hotelId }: InventoryStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStats() {
      if (!hotelId) return;
      
      setLoading(true);
      try {
        const data = await inventoryApi.getStats(hotelId);
        setStats(data);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [hotelId]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-blue-700"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold mb-3">Estadísticas de ocupación</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-gray-600">Total habitaciones</p>
          <p className="text-xl font-bold">{stats.totalRooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Ocupadas</p>
          <p className="text-xl font-bold text-green-600">{stats.occupiedRooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Disponibles</p>
          <p className="text-xl font-bold text-blue-600">{stats.availableRooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tasa ocupación</p>
          <p className="text-xl font-bold text-purple-600">{stats.occupancyRate}%</p>
        </div>
      </div>
    </div>
  );
}