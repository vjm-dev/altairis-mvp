export interface RoomType {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  hotelId: number;
  isActive?: boolean;
  availableRooms?: number;
  hotelName?: string;
}