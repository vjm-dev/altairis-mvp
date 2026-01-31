export interface DeleteHotelButtonProps {
  hotelId: number;
  hotelName: string;
  onDeleted: () => void;
}