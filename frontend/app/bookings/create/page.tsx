'use client';

import { useState, useEffect } from 'react';
import { bookingApi, hotelApi, roomTypeApi, inventoryApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreateBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hotels, setHotels] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any>(null);
  const [formData, setFormData] = useState({
    hotelId: 0,
    roomTypeId: 0,
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    numberOfRooms: 1,
    numberOfGuests: 2,
    notes: '',
    totalAmount: 0,
  });

  useEffect(() => {
    async function loadHotels() {
      try {
        const data = await hotelApi.getHotels(1, 100);
        setHotels(data.items || []);
      } catch (error) {
        console.error('Error cargando hoteles:', error);
      }
    }
    loadHotels();
  }, []);

  useEffect(() => {
    async function loadRoomTypes() {
      if (!formData.hotelId) {
        setRoomTypes([]);
        return;
      }
      try {
        const data = await roomTypeApi.getByHotel(formData.hotelId);
        setRoomTypes(data || []);
      } catch (error) {
        console.error('Error cargando tipos de habitación:', error);
      }
    }
    loadRoomTypes();
  }, [formData.hotelId]);

  useEffect(() => {
    async function checkAvailabilityAndCalculate() {
      if (!formData.hotelId || !formData.roomTypeId || !formData.checkInDate) {
        setAvailability(null);
        setError('');
        return;
      }
      
      try {
        const inventoryData = await inventoryApi.getByHotel(formData.hotelId, formData.checkInDate);
        const roomTypeAvailability = inventoryData.find(
          (item: any) => item.roomTypeId === formData.roomTypeId
        );
        
        setAvailability(roomTypeAvailability || null);
        
        if (!roomTypeAvailability) {
          setError('No hay inventario configurado para este tipo de habitación en las fechas seleccionadas. Por favor, configure el inventario primero.');
        } else {
          setError('');
        }
        
        const selectedRoomType = roomTypes.find(r => r.id === formData.roomTypeId);
        const pricePerNight = roomTypeAvailability?.price || selectedRoomType?.basePrice || 0;
        
        const nights = Math.ceil(
          (new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        
        const total = pricePerNight * formData.numberOfRooms * nights;
        setFormData(prev => ({ ...prev, totalAmount: total }));
        
      } catch (error) {
        console.error('Error verificando disponibilidad:', error);
        setAvailability(null);
        setError('No se pudo verificar la disponibilidad. Por favor, configure el inventario primero.');
        
        const selectedRoomType = roomTypes.find(r => r.id === formData.roomTypeId);
        if (selectedRoomType) {
          const nights = Math.ceil(
            (new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          const total = selectedRoomType.basePrice * formData.numberOfRooms * nights;
          setFormData(prev => ({ ...prev, totalAmount: total }));
        }
      }
    }
    
    checkAvailabilityAndCalculate();
  }, [
    formData.hotelId, 
    formData.roomTypeId, 
    formData.checkInDate, 
    formData.checkOutDate, 
    formData.numberOfRooms,
    roomTypes
  ]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
      setError('La fecha de salida debe ser posterior a la de entrada');
      setLoading(false);
      return;
    }

    if (formData.numberOfRooms < 1) {
      setError('Debe reservar al menos una habitación');
      setLoading(false);
      return;
    }

    if (formData.numberOfGuests < 1) {
      setError('Debe haber al menos un huésped');
      setLoading(false);
      return;
    }

    if (!availability) {
      setError('No hay inventario configurado para este tipo de habitación. Por favor, configure el inventario en la página de gestión de disponibilidad.');
      setLoading(false);
      return;
    }

    if (availability.availableRooms < formData.numberOfRooms) {
      setError(`No hay suficientes habitaciones disponibles. Solo hay ${availability.availableRooms} disponibles.`);
      setLoading(false);
      return;
    }

    const selectedRoomType = roomTypes.find(r => r.id === formData.roomTypeId);
    const maxCapacityPerRoom = selectedRoomType?.capacity || 2;
    const totalCapacity = maxCapacityPerRoom * formData.numberOfRooms;
    
    if (formData.numberOfGuests > totalCapacity) {
      setError(`Supera la capacidad máxima. Cada habitación tiene capacidad para ${maxCapacityPerRoom} personas. Máximo total: ${totalCapacity} personas.`);
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        hotelId: formData.hotelId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfGuests: formData.numberOfGuests,
        notes: formData.notes,
        rooms: [
          {
            roomTypeId: formData.roomTypeId,
            numberOfRooms: formData.numberOfRooms
          }
        ]
      };
      
      console.log('Enviando reserva al backend:', bookingData);
      
      const result = await bookingApi.createBooking(bookingData);
      alert('Reserva creada exitosamente');
      router.push('/bookings');
    } catch (err: any) {
      console.error('Error creando reserva:', err);
      setError(err.message || 'Error al crear la reserva. Verifica que todos los campos sean correctos.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoomType = roomTypes.find(r => r.id === formData.roomTypeId);
  const availableRooms = availability?.availableRooms || 0;
  
  const nights = Math.ceil(
    (new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  const pricePerNight = availability?.price || selectedRoomType?.basePrice || 0;
  const maxCapacityPerRoom = selectedRoomType?.capacity || 2;
  const totalCapacity = maxCapacityPerRoom * formData.numberOfRooms;

  const isSubmitDisabled = loading || 
    !formData.hotelId || 
    !formData.roomTypeId || 
    formData.numberOfGuests > totalCapacity || 
    !availability || 
    availability?.availableRooms < formData.numberOfRooms;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Crear nueva reserva</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-700 font-bold mb-1">Error</h3>
          <p className="text-red-600">{error}</p>
          {error.includes('inventario') && (
            <a 
              href={`/inventory?hotel=${formData.hotelId}`}
              className="text-blue-600 hover:text-blue-800 text-sm underline mt-2 inline-block"
            >
              Ir a configuración de inventario
            </a>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hotel info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Información del hotel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hotel *</label>
                <select
                  required
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.hotelId}
                  onChange={(e) => {
                    const hotelId = parseInt(e.target.value);
                    setFormData({
                      ...formData, 
                      hotelId, 
                      roomTypeId: 0,
                      totalAmount: 0
                    });
                    setAvailability(null);
                    setError('');
                  }}
                >
                  <option value="">Seleccionar hotel</option>
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name} - {hotel.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de habitación *</label>
                <select
                  required
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.roomTypeId}
                  onChange={(e) => {
                    setFormData({...formData, roomTypeId: parseInt(e.target.value)});
                    setError('');
                  }}
                  disabled={!formData.hotelId}
                >
                  <option value="">Seleccionar tipo</option>
                  {roomTypes.map(roomType => (
                    <option key={roomType.id} value={roomType.id}>
                      {roomType.name} - €{roomType.basePrice}/noche
                    </option>
                  ))}
                </select>
                {selectedRoomType && (
                  <p className="text-sm text-gray-500 mt-1">
                    Capacidad máxima por habitación: {selectedRoomType.capacity} personas
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Fechas de estancia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de entrada *</label>
                <input
                  type="date"
                  required
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.checkInDate}
                  onChange={(e) => {
                    setFormData({...formData, checkInDate: e.target.value});
                    setError('');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de salida *</label>
                <input
                  type="date"
                  required
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.checkOutDate}
                  onChange={(e) => {
                    setFormData({...formData, checkOutDate: e.target.value});
                    setError('');
                  }}
                  min={formData.checkInDate}
                />
              </div>
            </div>
            {nights > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Estancia de <span className="font-bold">{nights} noche{nights !== 1 ? 's' : ''}</span>
              </p>
            )}
          </div>

          {/* Client info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Información del cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  placeholder="ejemplo@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                  placeholder="+34 600 123 456"
                />
              </div>
            </div>
          </div>

          {/* Booking details */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Detalles de la reserva</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Habitaciones *</label>
                <input
                  type="number"
                  min="1"
                  max={availability ? availableRooms : 999}
                  required
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.numberOfRooms}
                  onChange={(e) => {
                    const rooms = parseInt(e.target.value);
                    setFormData({...formData, numberOfRooms: rooms});
                  }}
                  disabled={!availability}
                />
                <div className="text-sm mt-1">
                  {availability ? (
                    <>
                      <p className="text-gray-500">
                        Disponibles: <span className={`font-bold ${availableRooms < formData.numberOfRooms ? 'text-red-600' : 'text-green-600'}`}>
                          {availableRooms}
                        </span>
                      </p>
                      {availableRooms === 0 && (
                        <p className="bg-red-200 text-red-600 text-xs rounded-sm mt-1">
                          ❌ No hay habitaciones disponibles para esta fecha
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="bg-red-200 text-red-600 rounded-sm font-medium">
                        ⚠ No hay inventario configurado para esta fecha
                      </p>
                      {formData.hotelId > 0 && (
                        <a 
                          href={`/inventory?hotel=${formData.hotelId}`}
                          className="text-blue-600 hover:text-blue-800 text-xs underline"
                        >
                          Configurar inventario primero
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total huéspedes *</label>
                <input
                  type="number"
                  min="1"
                  max={totalCapacity}
                  required
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({...formData, numberOfGuests: parseInt(e.target.value)})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Capacidad máxima: {totalCapacity} personas
                  {formData.numberOfGuests > totalCapacity && (
                    <span className="text-red-600 ml-2">
                      (¡Supera la capacidad!)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Notas / Solicitudes especiales</label>
            <textarea
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Camas extras, alergias alimentarias, preferencias de piso, hora de llegada..."
            />
          </div>
        </div>

        {/* Summary and price */}
        <div className="bg-sky-500/50 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Resumen de la reserva</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotel:</span>
                  <span className="font-medium">
                    {hotels.find(h => h.id === formData.hotelId)?.name || 'No seleccionado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de habitación:</span>
                  <span className="font-medium">
                    {selectedRoomType?.name || 'No seleccionado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fechas:</span>
                  <span className="font-medium">
                    {formData.checkInDate} a {formData.checkOutDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Noches:</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Habitaciones:</span>
                  <span className="font-medium">{formData.numberOfRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Huéspedes:</span>
                  <span className="font-medium">{formData.numberOfGuests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio por noche:</span>
                  <span className="font-medium">€{pricePerNight.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-sky-600/50 rounded-lg p-4 border">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total estimado:</span>
                  <span className="text-2xl font-bold text-green-300">
                    €{formData.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• {formData.numberOfRooms} habitación{formData.numberOfRooms !== 1 ? 'es' : ''} × {nights} noche{nights !== 1 ? 's' : ''}</p>
                  <p>• Precio por noche: €{pricePerNight.toFixed(2)}</p>
                  <p>• Total huéspedes: {formData.numberOfGuests}</p>
                  <p>• El precio final lo calculará el sistema</p>
                  {!availability && (
                    <p className="bg-yellow-200 text-yellow-600 rounded-sm mt-2">
                      ⚠ El precio se basa en la tarifa base del tipo de habitación
                    </p>
                  )}
                  {availability && availableRooms === 0 && (
                    <p className="bg-red-200 text-red-600 rounded-sm mt-2">
                      ❌ No hay habitaciones disponibles
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitDisabled}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></span>
                Creando reserva...
              </span>
            ) : (
              'Crear reserva'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}