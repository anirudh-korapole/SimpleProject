import { ApiResponse, Room, AdminBookingView, RoomType, HotelSettings } from "../types/api.types";

function getToken(): string {
  return localStorage.getItem("adminToken") ?? "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function adminLogin(
  username: string,
  password: string
): Promise<ApiResponse<{ token: string }>> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function adminGetRooms(): Promise<ApiResponse<Room[]>> {
  const res = await fetch("/api/admin/rooms", { headers: authHeaders() });
  return res.json();
}

export async function adminCreateRoom(data: Omit<Room, "id" | "createdAt">): Promise<ApiResponse<Room>> {
  const res = await fetch("/api/admin/rooms", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteRoom(id: number): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/rooms/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function adminUpdateAvailability(id: number, isAvailable: boolean): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/rooms/${id}/availability`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ isAvailable }),
  });
  return res.json();
}

export async function adminGetBookings(): Promise<ApiResponse<AdminBookingView[]>> {
  const res = await fetch("/api/admin/bookings", { headers: authHeaders() });
  return res.json();
}

export async function adminGetRoomTypes(): Promise<ApiResponse<RoomType[]>> {
  const res = await fetch("/api/admin/room-types", { headers: authHeaders() });
  return res.json();
}

export async function adminCreateRoomType(data: { name: string; description?: string }): Promise<ApiResponse<RoomType>> {
  const res = await fetch("/api/admin/room-types", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteRoomType(id: number): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/room-types/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function adminGetSettings(): Promise<ApiResponse<HotelSettings>> {
  const res = await fetch("/api/admin/settings", { headers: authHeaders() });
  return res.json();
}

export async function adminUpdateSettings(data: Partial<HotelSettings>): Promise<ApiResponse<HotelSettings>> {
  const res = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}
