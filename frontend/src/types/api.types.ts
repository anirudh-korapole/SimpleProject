// Mirror of the backend's ApiResponse and Entry types.
// Keeping them in sync ensures the frontend always understands the server's shape.

export interface Entry {
  id: number;
  textValue: string;
  email: string;
  createdAt: string; // ISO 8601 string after JSON serialisation
}

export interface RoomBooking {
  id: number;
  entryId: number;
  roomNumber: string;
  numGuests: number;
  createdAt: string;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}
