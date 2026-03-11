import { Request, Response } from "express";
import { AdminService } from "../services/admin.service";
import { RoomRepository, RoomTypeRepository } from "../repositories/room.repository";
import { SettingsRepository, HotelSettings } from "../repositories/settings.repository";
import { AdminLoginRequest, AdminLoginResponse } from "../types/admin.types";
import { CreateRoomRequest, UpdateAvailabilityRequest, ApiResponse, Room, AdminBookingView, RoomType, CreateRoomTypeRequest } from "../types/room.types";

const adminService = new AdminService();
const roomRepository = new RoomRepository();
const roomTypeRepository = new RoomTypeRepository();
const settingsRepository = new SettingsRepository();

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as AdminLoginRequest;

  try {
    const token = adminService.login(username, password);
    const response: ApiResponse<AdminLoginResponse> = {
      success: true,
      message: "Login successful",
      data: { token },
    };
    res.status(200).json(response);
  } catch (error) {
    const err = error as Error;
    res.status(401).json({ success: false, message: err.message });
  }
}

export async function getRooms(req: Request, res: Response): Promise<void> {
  try {
    const rooms = await roomRepository.getAll();
    const response: ApiResponse<Room[]> = { success: true, message: "OK", data: rooms };
    res.status(200).json(response);
  } catch (error) {
    console.error("[getRooms]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}

export async function createRoom(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateRoomRequest;

  if (!body.roomNumber?.trim() || !body.capacity || !body.bedType?.trim() || !body.toiletType?.trim()) {
    res.status(400).json({ success: false, message: "roomNumber, capacity, bedType and toiletType are required" });
    return;
  }

  try {
    const room = await roomRepository.create(body);
    const response: ApiResponse<Room> = { success: true, message: "Room created", data: room };
    res.status(201).json(response);
  } catch (error) {
    console.error("[createRoom]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}

export async function deleteRoom(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ success: false, message: "Invalid room id" });
    return;
  }

  try {
    await roomRepository.deleteById(id);
    res.status(200).json({ success: true, message: "Room deleted" });
  } catch (error) {
    console.error("[deleteRoom]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}

export async function updateAvailability(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  const { isAvailable } = req.body as UpdateAvailabilityRequest;

  if (isNaN(id)) {
    res.status(400).json({ success: false, message: "Invalid room id" });
    return;
  }

  if (typeof isAvailable !== "boolean") {
    res.status(400).json({ success: false, message: "isAvailable must be a boolean" });
    return;
  }

  try {
    await roomRepository.updateAvailability(id, isAvailable);
    res.status(200).json({ success: true, message: "Availability updated" });
  } catch (error) {
    console.error("[updateAvailability]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}

export async function getBookings(req: Request, res: Response): Promise<void> {
  try {
    const bookings = await roomRepository.getAllBookings();
    const response: ApiResponse<AdminBookingView[]> = { success: true, message: "OK", data: bookings };
    res.status(200).json(response);
  } catch (error) {
    console.error("[getBookings]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}

export async function getRoomTypes(req: Request, res: Response): Promise<void> {
  try {
    const roomTypes = await roomTypeRepository.getAll();
    const response: ApiResponse<RoomType[]> = { success: true, message: "OK", data: roomTypes };
    res.status(200).json(response);
  } catch (error) {
    console.error("[getRoomTypes]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}

export async function createRoomType(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateRoomTypeRequest;

  if (!body.name?.trim()) {
    res.status(400).json({ success: false, message: "name is required" });
    return;
  }

  try {
    const roomType = await roomTypeRepository.create(body);
    const response: ApiResponse<RoomType> = { success: true, message: "Room type created", data: roomType };
    res.status(201).json(response);
  } catch (error) {
    console.error("[createRoomType]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}

export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const settings = await settingsRepository.getAll();
    res.status(200).json({ success: true, message: "OK", data: settings });
  } catch (error) {
    console.error("[getSettings]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const { checkInTime, checkOutTime, is24Hour } = req.body as Partial<HotelSettings>;
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (is24Hour !== undefined) {
    await settingsRepository.set("is24Hour", String(is24Hour));
  }
  if (checkInTime !== undefined) {
    if (!timeRegex.test(checkInTime)) {
      res.status(400).json({ success: false, message: "checkInTime must be HH:MM (24-hour)" });
      return;
    }
    await settingsRepository.set("checkInTime", checkInTime);
  }
  if (checkOutTime !== undefined) {
    if (!timeRegex.test(checkOutTime)) {
      res.status(400).json({ success: false, message: "checkOutTime must be HH:MM (24-hour)" });
      return;
    }
    await settingsRepository.set("checkOutTime", checkOutTime);
  }

  try {
    const updated = await settingsRepository.getAll();
    res.status(200).json({ success: true, message: "Settings updated", data: updated });
  } catch (error) {
    console.error("[updateSettings]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}

export async function deleteRoomType(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ success: false, message: "Invalid room type id" });
    return;
  }

  try {
    await roomTypeRepository.deleteById(id);
    res.status(200).json({ success: true, message: "Room type deleted" });
  } catch (error) {
    console.error("[deleteRoomType]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}
