import { ApiResponse } from "./entry.types";

/** Shape of the JSON body expected by POST /api/room-booking */
export interface CreateRoomBookingRequest {
  entryId: number;
  roomNumber: string;
  numGuests: number;
}

/** A row from the RoomBookings table */
export interface RoomBooking {
  id: number;
  entryId: number;
  roomNumber: string;
  numGuests: number;
  createdAt: Date;
}

// Re-export so callers only need to import from this file.
export type { ApiResponse };
