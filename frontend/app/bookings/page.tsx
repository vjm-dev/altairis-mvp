'use client';

import { useState, useEffect } from 'react';
import { bookingApi } from '@/lib/api';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await bookingApi.getBookings(1, 50, statusFilter);
      setBookings(data.items || []);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(id: number, newStatus: string) {
    try {
      await bookingApi.updateStatus(id, newStatus);
      loadBookings();
    } catch (error) {
      alert('Error actualizando reserva');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de reservas</h1>
        <a 
          href="/bookings/create"
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          + Añadir nueva reserva
        </a>
      </div>

      <div className="mb-6">
        <select
          className="p-3 border rounded-lg bg-white dark:bg-gray-500 text-gray-700 dark:text-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todas las reservas</option>
          <option value="Confirmed">Confirmadas</option>
          <option value="Pending">Pendientes</option>
          <option value="Cancelled">Canceladas</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-700"></div>
          <p className="mt-2 text-gray-600">Cargando reservas...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No hay reservas</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">Nº Reserva</th>
                <th className="px-6 py-3 text-left">Hotel</th>
                <th className="px-6 py-3 text-left">Cliente</th>
                <th className="px-6 py-3 text-left">Fechas</th>
                <th className="px-6 py-3 text-left">Importe</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-sky-500/100">
                  <td className="px-6 py-4 font-medium">{booking.bookingNumber}</td>
                  <td className="px-6 py-4">{booking.hotelName}</td>
                  <td className="px-6 py-4">{booking.customerName}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div>Entrada: {new Date(booking.checkInDate).toLocaleDateString()}</div>
                      <div>Salida: {new Date(booking.checkOutDate).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    €{booking.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {booking.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'Confirmed')}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'Cancelled')}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
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