'use client';

import { useState, useEffect } from 'react';
import { hotelApi, roomTypeApi } from '@/lib/api';
import { useParams } from 'next/navigation';
import InventoryStats from '@/components/inventory-stats';
import DeleteHotelButton from '@/components/delete-hotel-button';

interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  starRating: number;
  phone: string;
  email: string;
  isActive: boolean;
}

interface RoomType {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  hotelId: number;
}

export default function HotelDetailPage() {
  const params = useParams();
  const hotelId = Number(params.id);

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    async function loadHotel() {
      try {
        const [hotelData, roomTypesData] = await Promise.all([
          hotelApi.getHotel(hotelId),
          roomTypeApi.getByHotel(hotelId),
        ]);
        setHotel(hotelData);
        setRoomTypes(roomTypesData);
      } catch (error) {
        console.error('Error cargando hotel:', error);
      } finally {
        setLoading(false);
      }
    }

    if (hotelId) {
      loadHotel();
    }
  }, [hotelId]);

  const handleRoomTypeCreated = () => {
    roomTypeApi.getByHotel(hotelId).then(setRoomTypes);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-700"></div>
        <p className="mt-2 text-gray-600">Cargando hotel...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-red-700 font-bold">Hotel no encontrado</h2>
        <p className="text-red-600">El hotel que buscas no existe.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{hotel.name}</h1>
          <p className="text-gray-600">
            {hotel.city}, {hotel.country} • {hotel.starRating} estrellas
          </p>
        </div>
        <div className="flex space-x-3">
          <a
            href={`/hotels/${hotelId}/edit`}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Editar
          </a>
          <DeleteHotelButton
            hotelId={hotelId}
            hotelName={hotel.name}
            onDeleted={() => window.location.href = '/hotels'}
          />
        </div>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-600'}`}
          >
            Detalles
          </button>
          <button
            onClick={() => setActiveTab('room-types')}
            className={`px-4 py-2 ${activeTab === 'room-types' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-600'}`}
          >
            Tipos de habitación ({roomTypes.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 ${activeTab === 'inventory' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-600'}`}
          >
            Inventario
          </button>
        </nav>
      </div>

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-gray-500 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Información del hotel</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-black dark:text-gray-700">Dirección:</label>
                <p className="mt-1">{hotel.address || 'No especificada'}</p>
              </div>
              <div>
                <label className="font-medium text-black dark:text-gray-700">Teléfono:</label>
                <p className="mt-1">{hotel.phone || 'No especificado'}</p>
              </div>
              <div>
                <label className="font-medium text-black dark:text-gray-700">Email:</label>
                <p className="mt-1">{hotel.email}</p>
              </div>
              <div>
                <label className="font-medium text-black dark:text-gray-700">Estado:</label>
                <span className={`mt-1 inline-block px-3 py-1 rounded-full text-sm ${hotel.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {hotel.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <InventoryStats hotelId={hotelId} />
          </div>
        </div>
      )}

      {activeTab === 'room-types' && (
        <RoomTypeManager
          hotelId={hotelId}
          roomTypes={roomTypes}
          onRoomTypeCreated={handleRoomTypeCreated}
        />
      )}

      {activeTab === 'inventory' && (
        <div>
          <div className="bg-blue-500/50 rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Gestión de inventario</h3>
            <p className="text-gray-600 mb-4">
              Configura la disponibilidad de habitaciones por fecha.
            </p>
            <a
              href={`/inventory?hotel=${hotelId}`}
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 inline-block"
            >
              Gestionar disponibilidad
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomTypeManager({ hotelId, roomTypes, onRoomTypeCreated }: {
  hotelId: number;
  roomTypes: RoomType[];
  onRoomTypeCreated: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 100,
    maxOccupancy: 2,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await roomTypeApi.createRoomType({
        ...formData,
        hotelId,
      });
      onRoomTypeCreated();
      setShowForm(false);
      setFormData({ name: '', description: '', basePrice: 100, maxOccupancy: 2 });
    } catch (error) {
      console.error('Error creando tipo de habitación:', error);
      alert('Error al crear el tipo de habitación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Tipos de habitación</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          {showForm ? 'Cancelar' : '+ Nuevo tipo'}
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-500/50 rounded-lg shadow p-6 mb-6">
          <h4 className="text-lg font-bold mb-4">Crear tipo de habitación</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                required
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Precio base (€) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ocupación máxima *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.maxOccupancy}
                  onChange={(e) => setFormData({ ...formData, maxOccupancy: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear tipo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {roomTypes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No hay tipos de habitación definidos para este hotel.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            Crear el primer tipo de habitación
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Nombre</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Descripción</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Precio</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Ocupación</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {roomTypes.map((roomType) => (
                <tr key={roomType.id} className="hover:bg-sky-500/100">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{roomType.name}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{roomType.description || '-'}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">€{roomType.basePrice}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{roomType.maxOccupancy} personas</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    <button
                      onClick={async () => {
                        if (confirm('¿Eliminar este tipo de habitación?')) {
                          try {
                            await roomTypeApi.deleteRoomType(roomType.id);
                            onRoomTypeCreated();
                          } catch (error) {
                            alert('Error al eliminar');
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}