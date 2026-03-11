import { ApiResponse, RoomBooking, GuestDetail, RoomTypeAvailable, HotelSettings } from "../types/api.types";

export async function createRoomBooking(data: {
  entryId: number;
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
  guests: GuestDetail[];
}): Promise<ApiResponse<RoomBooking>> {
  const response = await fetch("/api/room-booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getAvailableRoomTypes(
  checkIn: string,
  checkOut: string
): Promise<ApiResponse<RoomTypeAvailable[]>> {
  const response = await fetch(`/api/room-types/available?checkIn=${checkIn}&checkOut=${checkOut}`);
  return response.json();
}

export async function getHotelSettings(): Promise<HotelSettings> {
  const response = await fetch("/api/settings");
  const data = await response.json();
  return data.data ?? { checkInTime: "14:00", checkOutTime: "11:00" };
}

export async function getFullyBookedDates(): Promise<Date[]> {
  const response = await fetch("/api/rooms/booked-dates");
  const data = await response.json();
  const dateStrings: string[] = data.data?.dates ?? [];
  return dateStrings.map((s) => {
    const [year, month, day] = s.split("-").map(Number);
    return new Date(year, month - 1, day);
  });
}
