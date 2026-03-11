import { ApiResponse } from "./entry.types";

export interface GuestDetail {
  name: string;
  age: number;
  gender: string;
}

/** Shape of the JSON body expected by POST /api/room-booking */
export interface CreateRoomBookingRequest {
  entryId: number;
  roomTypeId: number;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  guests: GuestDetail[];
}

/** A room type with availability info and aggregated amenities, returned to users */
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

/** A row from the RoomBookings table */
export interface RoomBooking {
  id: number;
  entryId: number;
  roomNumber: string;
  numGuests: number;
  checkIn: Date | null;
  checkOut: Date | null;
  createdAt: Date;
}

/** A row from the BookingGuests table */
export interface BookingGuest {
  id: number;
  bookingId: number;
  guestName: string;
  guestAge: number;
  guestGender: string;
}

/** A row from the Rooms table */
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
  createdAt: Date;
}

/** A row from the RoomTypes table */
export interface RoomType {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
}

/** Body for POST /api/admin/room-types */
export interface CreateRoomTypeRequest {
  name: string;
  description?: string;
}

/** Body for POST /api/admin/rooms */
export interface CreateRoomRequest {
  roomNumber: string;
  roomType?: string | null;
  roomTypeId?: number | null;
  capacity: number;
  isAvailable?: boolean;
  hasAC?: boolean;
  hasWifi?: boolean;
  hasGeyser?: boolean;
  smokingAllowed?: boolean;
  hasElectricityBackup?: boolean;
  toiletType: string;
  bedType: string;
}

/** Body for PATCH /api/admin/rooms/:id/availability */
export interface UpdateAvailabilityRequest {
  isAvailable: boolean;
}

/** JOIN result for admin bookings view */
export interface AdminBookingView {
  id: number;
  entryId: number;
  roomNumber: string;
  numGuests: number;
  checkIn: Date | null;
  checkOut: Date | null;
  createdAt: Date;
  guestName: string;
  email: string;
  phone: string;
}

// Re-export so callers only need to import from this file.
export type { ApiResponse };
