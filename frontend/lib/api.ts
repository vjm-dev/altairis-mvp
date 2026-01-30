const API_BASE = 'http://localhost:5000/api';

interface ApiError {
  type?: string;
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
  traceId?: string;
}

async function fetchApi(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        var errorText = '';
        const errorData: ApiError = await response.json();
        let errorMessage = `API Error: ${response.status}`;
        
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
        errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } else {
      errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
  }

  return response.json();
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

  updateHotel: (id: number, data: any) => 
    fetchApi(`/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

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