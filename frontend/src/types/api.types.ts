// Mirror of the backend's ApiResponse and Entry types.
// Keeping them in sync ensures the frontend always understands the server's shape.

export interface Entry {
  id: number;
  textValue: string;
  email: string;
  phone: string;
  createdAt: string; // ISO 8601 string after JSON serialisation
}

export interface GuestDetail {
  name: string;
  age: number;
  gender: string;
}

export interface RoomBooking {
  id: number;
  entryId: number;
  roomNumber: string;
  numGuests: number;
  checkIn: string | null;
  checkOut: string | null;
  createdAt: string;
}

export interface RoomType {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface RoomTypeAvailable {
  id: number;
  name: string;
  description: string | null;
  availableCount: number;
  capacity: number;
  hasAC: boolean;
  hasWifi: boolean;
  hasGeyser: boolean;
  smokingAllowed: boolean;
  hasElectricityBackup: boolean;
}

export interface Room {
  id: number;
  roomNumber: string;
  roomType: string | null;
  roomTypeId: number | null;
  capacity: number;
  isAvailable: boolean;
  hasAC: boolean;
  hasWifi: boolean;
  hasGeyser: boolean;
  smokingAllowed: boolean;
  hasElectricityBackup: boolean;
  toiletType: string;
  bedType: string;
  createdAt: string;
}

export interface AdminBookingView {
  id: number;
  entryId: number;
  roomNumber: string;
  numGuests: number;
  checkIn: string | null;
  checkOut: string | null;
  createdAt: string;
  guestName: string;
  email: string;
  phone: string;
}

export interface HotelSettings {
  checkInTime: string;  // HH:MM
  checkOutTime: string; // HH:MM
  is24Hour: boolean;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}
