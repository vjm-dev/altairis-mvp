const API_BASE = 'http://localhost:5000/api';

interface ApiError {
  type?: string;
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
  traceId?: string;
}

export async function fetchApi(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    console.log(`API Call: ${options?.method || 'GET'} ${endpoint}`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (response.status === 204) {
      console.log(`204 No Content response for ${endpoint}`);
      return null;
    }

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      let errorText = '';
      try {
        errorText = await response.text();
      } catch {
        errorText = 'No se pudo obtener el mensaje de error';
      }
      
      if (contentType && contentType.includes('application/json') && errorText) {
        try {
          const errorData: ApiError = JSON.parse(errorText);
          let errorMessage = `Error ${response.status}: ${response.statusText}`;
          
          if (errorData.title) {
            errorMessage += ` - ${errorData.title}`;
          }
          
          if (errorData.errors) {
            const errorDetails = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('; ');
            errorMessage += ` [${errorDetails}]`;
          }
          
          throw new Error(errorMessage);
        } catch {
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
      } else {
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const text = await response.text();
        if (!text || text.trim() === '') {
          console.log(`Empty response body for ${endpoint}, returning null`);
          return null;
        }
        return JSON.parse(text);
      } catch (parseError) {
        console.error(`JSON parse error for ${endpoint}:`, parseError);
        return null;
      }
    }

    const text = await response.text();
    return text || null;

  } catch (error) {
    console.error(`fetchApi error for ${endpoint}:`, error);
    throw error;
  }
}

// Hotels
export const hotelApi = {
  getHotels: (page = 1, pageSize = 20, search = '') => 
    fetchApi(`/hotels?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`),

  getHotel: (id: number) => fetchApi(`/hotels/${id}`),

  createHotel: (data: any) => 
    fetchApi('/hotels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateHotel: async (id: number, data: any) => {
    try {
      const response = await fetchApi(`/hotels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      if (response === null || response === undefined) {
        return { success: true, message: 'Hotel actualizado correctamente' };
      }
      
      return response;
    } catch (error) {
      console.error('Error in updateHotel:', error);
      throw error;
    }
  },

  deleteHotel: (id: number) => 
    fetchApi(`/hotels/${id}`, {
      method: 'DELETE',
    }),

  getCountries: () => 
    fetchApi('/hotels/countries'),
};

// Room type
export const roomTypeApi = {
  getByHotel: (hotelId: number) => 
    fetchApi(`/roomtypes/hotel/${hotelId}`),

  getRoomType: (id: number) => 
    fetchApi(`/roomtypes/${id}`),

  createRoomType: (data: any) => 
    fetchApi('/roomtypes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRoomType: (id: number, data: any) => 
    fetchApi(`/roomtypes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRoomType: (id: number) => 
    fetchApi(`/roomtypes/${id}`, {
      method: 'DELETE',
    }),
};

// Inventory
export const inventoryApi = {
  getByRoomType: (roomTypeId: number) => 
    fetchApi(`/inventory/roomtype/${roomTypeId}`),

  getByHotel: (hotelId: number, date: string) => 
    fetchApi(`/inventory/hotel/${hotelId}?date=${encodeURIComponent(date)}`),

  updateInventory: (id: number, data: any) => 
    fetchApi(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  bulkUpdateInventory: (data: any) => 
    fetchApi('/inventory/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStats: (hotelId: number) => 
    fetchApi(`/inventory/stats/${hotelId}`),
};

// Bookings
export const bookingApi = {
  getBookings: (page = 1, pageSize = 20, status = '') => 
    fetchApi(`/bookings?page=${page}&pageSize=${pageSize}&status=${encodeURIComponent(status)}`),

  getBooking: (id: number) => 
    fetchApi(`/bookings/${id}`),

  createBooking: (data: any) => 
    fetchApi('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: string) => 
    fetchApi(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getDashboardStats: () => 
    fetchApi('/bookings/dashboard/stats'),
};