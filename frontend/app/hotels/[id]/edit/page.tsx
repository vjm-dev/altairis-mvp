'use client';

import { useState, useEffect } from 'react';
import { hotelApi } from '@/shared/utils/api';
import { useParams, useRouter } from 'next/navigation';

export default function EditHotelPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = Number(params.id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    chainCode: 'ALT',
    address: '',
    city: '',
    country: 'Spain',
    postalCode: '',
    phone: '',
    email: '',
    starRating: 3,
    isActive: true,
  });

  useEffect(() => {
    async function loadHotel() {
      setLoading(true);
      setError('');
      try {
        const hotel = await hotelApi.getHotel(hotelId);
        setFormData({
          name: hotel.name,
          chainCode: hotel.chainCode || 'ALT',
          address: hotel.address || '',
          city: hotel.city,
          country: hotel.country,
          postalCode: hotel.postalCode || '',
          phone: hotel.phone || '',
          email: hotel.email,
          starRating: hotel.starRating,
          isActive: hotel.isActive,
        });
      } catch (err: any) {
        console.error('Error detallado al cargar hotel:', err);
        setError(`Error al cargar el hotel: ${err.message || 'No se pudo cargar la información'}`);
      } finally {
        setLoading(false);
      }
    }

    if (hotelId) {
      loadHotel();
    }
  }, [hotelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('Enviando datos de actualización:', formData);
      const response = await hotelApi.updateHotel(hotelId, formData);
      console.log('Respuesta del servidor:', response);
      
      setSuccess('Hotel actualizado correctamente');
      
      setTimeout(() => {
        router.push(`/hotels/${hotelId}`);
        router.refresh();
      }, 1500);
      
    } catch (err: any) {
      console.error('Error detallado al actualizar hotel:', err);
      
      if (err.message.includes('Unexpected end of JSON input')) {
        setError('El servidor devolvió una respuesta vacía. Puede que la actualización se haya realizado pero el servidor no respondió correctamente.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else if (err.message.includes('404')) {
        setError('Hotel no encontrado. Puede que haya sido eliminado.');
      } else {
        setError(`Error al actualizar el hotel: ${err.message || 'Error desconocido'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-700"></div>
        <p className="mt-2 text-gray-600">Cargando hotel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Editar hotel</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-700 font-bold mb-1">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 text-sm mt-2 underline"
          >
            Recargar página
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-green-700 font-bold mb-1">Éxito</h3>
          <p className="text-green-600">{success}</p>
          <p className="text-sm text-green-500 mt-2">Redirigiendo...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-500 rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            required
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nombre del hotel"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Código de cadena</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.chainCode}
            onChange={(e) => setFormData({...formData, chainCode: e.target.value})}
            placeholder="Ej: ALT"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad *</label>
            <input
              type="text"
              required
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="Ej: Madrid"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">País *</label>
            <select
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
            >
              <option value="Spain">España</option>
              <option value="France">Francia</option>
              <option value="Italy">Italia</option>
              <option value="Germany">Alemania</option>
              <option value="Portugal">Portugal</option>
              <option value="United Kingdom">Reino Unido</option>
              <option value="United States">Estados Unidos</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dirección completa</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Calle, número"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Código postal</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.postalCode}
              onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
              placeholder="Ej: 28013"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+34 91 123 4567"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email de contacto *</label>
          <input
            type="email"
            required
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="contacto@hotel.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoría (estrellas) *</label>
            <select
              required
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.starRating}
              onChange={(e) => setFormData({...formData, starRating: parseInt(e.target.value)})}
            >
              {[1,2,3,4,5].map(num => (
                <option key={num} value={num}>{num} estrella{num !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado *</label>
            <select
              required
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.isActive.toString()}
              onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></span>
                Guardando...
              </span>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}