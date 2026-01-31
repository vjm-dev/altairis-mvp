'use client';

import { useState } from 'react';
import { hotelApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreateHotel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    chainCode: 'ALT',
    address: '',
    city: '',
    country: 'Spain',
    postalCode: '',
    phone: '',
    email: 'admin@altairis.com',
    starRating: 3,
  });

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await hotelApi.createHotel(formData);
      router.push('/hotels');
    } catch (err: any) {
      setError(err.message || 'Error al crear el hotel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Añadir nuevo hotel</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
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
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoría (estrellas)</label>
          <select
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.starRating}
            onChange={(e) => setFormData({...formData, starRating: parseInt(e.target.value)})}
          >
            {[1,2,3,4,5].map(num => (
              <option key={num} value={num}>{num} estrella{num !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Añadir hotel'}
          </button>
        </div>
      </form>
    </div>
  );
}