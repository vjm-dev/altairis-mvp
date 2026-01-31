'use client';

import { useState, useEffect } from 'react';
import { inventoryApi } from '@/shared/utils/api';

interface InventoryStatsProps {
  hotelId: number;
}

export default function InventoryStats({ hotelId }: InventoryStatsProps) {
  const [stats, setStats] = useState<{
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      if (!hotelId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const inventoryData = await inventoryApi.getByHotel(hotelId, today);
        const calculatedStats = calculateStatsFromInventory(inventoryData);

        setStats(calculatedStats);
      } catch (error: any) {
        console.error('Error cargando estadísticas:', error);
        
        try {
          const statsData = await inventoryApi.getStats(hotelId);
          setStats({
            totalRooms: statsData.totalRooms || 0,
            occupiedRooms: statsData.occupiedRooms || statsData.reservedRooms || 0,
            availableRooms: statsData.availableRooms || 0,
            occupancyRate: statsData.occupancyRate || 0,
          });
        } catch (secondError) {
          setError('No se pudieron cargar las estadísticas');
          setStats({
            totalRooms: 0,
            occupiedRooms: 0,
            availableRooms: 0,
            occupancyRate: 0,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [hotelId]);

  function calculateStatsFromInventory(inventoryData: any[]) {
    if (!inventoryData || inventoryData.length === 0) {
      return {
        totalRooms: 0,
        occupiedRooms: 0,
        availableRooms: 0,
        occupancyRate: 0,
      };
    }

    const totalRooms = inventoryData.reduce((sum, item) => sum + (item.totalRooms || 0), 0);
    const occupiedRooms = inventoryData.reduce((sum, item) => sum + (item.reservedRooms || 0), 0);
    const availableRooms = inventoryData.reduce((sum, item) => sum + (item.availableRooms || 0), 0);
    
    const occupancyRate = totalRooms > 0 
      ? Math.round((occupiedRooms / totalRooms) * 100) 
      : 0;

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate,
    };
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-blue-700"></div>
        <p className="text-xs text-gray-500 mt-1">Cargando...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-yellow-700 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-blue-500/50 rounded-lg shadow p-4">
      <h3 className="font-bold mb-3 text-white">Estadísticas de ocupación</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-gray-600">Total habitaciones</p>
          <p className="text-xl font-bold text-cyan-100">{stats.totalRooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Ocupadas</p>
          <p className="text-xl font-bold text-green-600">{stats.occupiedRooms}</p>
        </div>
        <div>
          <p className="text-sm text-yellow">Disponibles</p>
          <p className="text-xl font-bold text-blue-300">{stats.availableRooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tasa ocupación</p>
          <p className="text-xl font-bold text-purple-600">{stats.occupancyRate}%</p>
        </div>
      </div>
      
      {/* Occupancy rate bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Ocupación</span>
          <span>{stats.occupancyRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              stats.occupancyRate > 79 ? 'bg-red-500' : 
              stats.occupancyRate > 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, stats.occupancyRate)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}