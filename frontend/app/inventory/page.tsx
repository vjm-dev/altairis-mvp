'use client';

import { useState, useEffect } from 'react';
import { inventoryApi, hotelApi } from '@/lib/api';

export default function InventoryPage() {
  const [selectedHotel, setSelectedHotel] = useState<number>(0);
  const [hotels, setHotels] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
      const data = await inventoryApi.getByHotel(selectedHotel, date);
      setInventory(data || []);
    } catch (error) {
      console.error(`Error cargando inventario del hotel ${selectedHotel}:`, error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedHotel) {
      loadInventory();
    }
  }, [selectedHotel, date]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestión de disponibilidad</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Hotel</label>
            <select
              className="w-full p-3 border rounded-lg"
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
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              className="w-full p-3 border rounded-lg"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={loadInventory}
              className="bg-blue-700 text-white px-4 py-3 rounded-lg hover:bg-blue-800 w-full"
            >
              Actualizar
            </button>
          </div>
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
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left">Tipo de habitación</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Reservadas</th>
                  <th className="px-6 py-3 text-left">Disponibles</th>
                  <th className="px-6 py-3 text-left">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{item.roomTypeName}</td>
                    <td className="px-6 py-4">{item.totalRooms}</td>
                    <td className="px-6 py-4">{item.reservedRooms}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded ${
                        item.availableRooms > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.availableRooms}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      €{item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}