'use client';

import { useState, useEffect } from 'react';
import { inventoryApi, hotelApi } from '@/shared/utils/api';

export default function InventoryPage() {
  const [selectedHotel, setSelectedHotel] = useState<number>(0);
  const [hotels, setHotels] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  async function loadHotels() {
    try {
      const data = await hotelApi.getHotels(1, 100);
      setHotels(data.items || []);
      if (data.items?.length > 0) {
        setSelectedHotel(data.items[0].id);
      }
    } catch (error) {
      console.error('Error cargando hoteles:', error);
    }
  }

  async function loadInventory() {
    if (!selectedHotel) return;
    
    setLoading(true);
    try {
      const data = await inventoryApi.getByHotel(selectedHotel, dateRange.startDate);
      setInventory(data || []);
    } catch (error: any) {
      console.error(`Error cargando inventario:`, error);
      alert(`Error: ${error.message || 'No se pudo cargar el inventario'}`);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }

  async function updatePrice(id: number) {
    try {
      await inventoryApi.updateInventory(id, {
        price: parseFloat(editPrice),
      });
      loadInventory();
      setEditing(null);
    } catch (error: any) {
      console.error('Error actualizando precio:', error);
      alert(`Error: ${error.message || 'No se pudo actualizar el precio'}`);
    }
  }

  async function bulkUpdateAvailability(change: number) {
    if (!selectedHotel || inventory.length === 0) return;
    
    setBulkUpdating(true);
    try {
      const updatePromises = inventory.map(item => 
        inventoryApi.updateInventory(item.id, {
          totalRooms: Math.max(0, item.totalRooms + change),
          price: item.price,
        })
      );
      
      await Promise.all(updatePromises);
      loadInventory();
    } catch (error: any) {
      console.error('Error actualizando disponibilidad:', error);
      alert(`Error: ${error.message || 'No se pudo actualizar la disponibilidad'}`);
    } finally {
      setBulkUpdating(false);
    }
  }

  async function updateRoomCount(id: number, change: number, currentPrice: number) {
    try {
      await inventoryApi.updateInventory(id, {
        totalRooms: Math.max(0, inventory.find(item => item.id === id)?.totalRooms + change),
        price: currentPrice,
      });
      loadInventory();
    } catch (error: any) {
      console.error('Error actualizando habitaciones:', error);
      alert(`Error: ${error.message || 'No se pudo actualizar'}`);
    }
  }

  useEffect(() => {
    if (selectedHotel) {
      loadInventory();
    }
  }, [selectedHotel, dateRange.startDate]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestión de disponibilidad</h1>
      
      <div className="bg-white dark:bg-gray-500 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Hotel</label>
            <select
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedHotel || ''}
              onChange={(e) => setSelectedHotel(Number(e.target.value))}
            >
              {hotels.map(hotel => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name} - {hotel.city}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Fecha inicio</label>
            <input
              type="date"
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Fecha fin</label>
            <input
              type="date"
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => bulkUpdateAvailability(1)}
            disabled={bulkUpdating || inventory.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bulkUpdating ? 'Actualizando...' : '+1 a todas las habitaciones'}
          </button>
          <button
            onClick={() => bulkUpdateAvailability(-1)}
            disabled={bulkUpdating || inventory.length === 0}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bulkUpdating ? 'Actualizando...' : '-1 a todas las habitaciones'}
          </button>
          <button
            onClick={loadInventory}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Actualizar vista
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-700"></div>
            <p className="mt-2 text-gray-600">Cargando disponibilidad...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No hay datos de disponibilidad para esta fecha
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">Tipo de habitación</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Reservadas</th>
                  <th className="px-6 py-3 text-left">Disponibles</th>
                  <th className="px-6 py-3 text-left">Ocupación</th>
                  <th className="px-6 py-3 text-left">Precio</th>
                  <th className="px-6 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {inventory.map((item) => {
                  const occupancyRate = item.totalRooms > 0 
                    ? Math.round((item.reservedRooms / item.totalRooms) * 100) 
                    : 0;
                  
                  return (
                    <tr key={item.id} className="hover:bg-sky-500/100">
                      <td className="px-6 py-4 font-medium">{item.roomTypeName}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold">{item.totalRooms}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-red-600">{item.reservedRooms}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded font-bold ${
                          item.availableRooms > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.availableRooms}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              occupancyRate > 80 ? 'bg-red-600' : 
                              occupancyRate > 50 ? 'bg-yellow-500' : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(100, occupancyRate)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 ml-2">{occupancyRate}%</span>
                      </td>
                      <td className="px-6 py-4">
                        {editing === item.id ? (
                          <div className="flex items-center">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-24 p-1 border rounded"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                            />
                            <button
                              onClick={() => updatePrice(item.id)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="ml-1 text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="font-bold">€{item.price}</span>
                            <button
                              onClick={() => {
                                setEditing(item.id);
                                setEditPrice(item.price.toString());
                              }}
                              className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateRoomCount(item.id, 1, item.price)}
                            className="text-green-600 hover:text-green-800"
                          >
                            + Habitación
                          </button>
                          <button
                            onClick={() => updateRoomCount(item.id, -1, item.price)}
                            className="text-red-600 hover:text-red-800"
                            disabled={item.totalRooms <= 0}
                          >
                            - Habitación
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-400/50 rounded-lg">
          <h4 className="font-bold text-white mb-2">Resumen de disponibilidad</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {inventory.reduce((sum, item) => sum + item.totalRooms, 0)}
              </div>
              <div className="text-sm text-gray-600">Total habitaciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {inventory.reduce((sum, item) => sum + item.availableRooms, 0)}
              </div>
              <div className="text-sm text-gray-600">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">
                {inventory.reduce((sum, item) => sum + item.reservedRooms, 0)}
              </div>
              <div className="text-sm text-gray-600">Reservadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">
                {inventory.length > 0 && inventory.reduce((sum, item) => sum + item.totalRooms, 0) > 0
                  ? Math.round(
                      (inventory.reduce((sum, item) => sum + item.reservedRooms, 0) / 
                       inventory.reduce((sum, item) => sum + item.totalRooms, 0)) * 100
                    ) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Tasa de ocupación</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}