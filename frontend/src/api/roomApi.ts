import { ApiResponse, RoomBooking } from "../types/api.types";

/**
 * Sends room booking data to POST /api/room-booking.
 *
 * Flow: RoomBookingForm.handleSubmit() → createRoomBooking()
 *       → Express /api/room-booking → RoomBookingController
 *       → RoomBookingService → RoomBookingRepository → SQL Server RoomBookings table
 */
export async function createRoomBooking(
  entryId: number,
  roomNumber: string,
  numGuests: number
): Promise<ApiResponse<RoomBooking>> {
  const response = await fetch("/api/room-booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entryId, roomNumber, numGuests }),
  });

  const data: ApiResponse<RoomBooking> = await response.json();
  return data;
}
