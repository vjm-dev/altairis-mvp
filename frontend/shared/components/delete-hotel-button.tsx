'use client';

import { useState } from 'react';
import { hotelApi } from '@/shared/utils/api';
import { DeleteHotelButtonProps } from '@/shared/interfaces/i_deletehotelbutton';

export default function DeleteHotelButton({ hotelId, hotelName, onDeleted }: DeleteHotelButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await hotelApi.deleteHotel(hotelId);
      onDeleted();
    } catch (error) {
      console.error('Error eliminando hotel:', error);
      alert('Error al eliminar el hotel');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-800 ml-3"
        disabled={isDeleting}
      >
        {isDeleting ? 'Eliminando...' : 'Eliminar'}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-6">
              ¿Estás seguro de que quieres eliminar el hotel <strong>{hotelName}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}