import { Router, Request, Response } from "express";
import { createRoomBooking } from "../controllers/room.controller";
import { RoomRepository, RoomBookingRepository } from "../repositories/room.repository";
import { SettingsRepository } from "../repositories/settings.repository";
import { ApiResponse, Room, RoomTypeAvailable } from "../types/room.types";

const router = Router();
const roomRepository = new RoomRepository();
const bookingRepository = new RoomBookingRepository();
const settingsRepository = new SettingsRepository();

// POST /api/room-booking
router.post("/room-booking", createRoomBooking);

// GET /api/rooms — all available rooms (public)
router.get("/rooms", async (req: Request, res: Response) => {
  try {
    const rooms = await roomRepository.getAvailable();
    const response: ApiResponse<Room[]> = { success: true, message: "OK", data: rooms };
    res.status(200).json(response);
  } catch (error) {
    console.error("[GET /api/rooms]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
});

// GET /api/rooms/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
// Returns room IDs that are unavailable for the given date range
router.get("/rooms/availability", async (req: Request, res: Response) => {
  const { checkIn, checkOut } = req.query as { checkIn?: string; checkOut?: string };

  if (!checkIn || !checkOut) {
    res.status(400).json({ success: false, message: "checkIn and checkOut query params are required" });
    return;
  }

  try {
    const unavailableRoomIds = await bookingRepository.getUnavailableRoomIds(checkIn, checkOut);
    res.status(200).json({ success: true, message: "OK", data: { unavailableRoomIds } });
  } catch (error) {
    console.error("[GET /api/rooms/availability]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
});

// GET /api/room-types/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
router.get("/room-types/available", async (req: Request, res: Response) => {
  const { checkIn, checkOut } = req.query as { checkIn?: string; checkOut?: string };

  if (!checkIn || !checkOut) {
    res.status(400).json({ success: false, message: "checkIn and checkOut query params are required" });
    return;
  }

  try {
    const roomTypes = await roomRepository.getAvailableRoomTypes(checkIn, checkOut);
    const response: ApiResponse<RoomTypeAvailable[]> = { success: true, message: "OK", data: roomTypes };
    res.status(200).json(response);
  } catch (error) {
    console.error("[GET /api/room-types/available]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
});

// GET /api/rooms/booked-dates — dates where all rooms are fully booked
router.get("/rooms/booked-dates", async (_req: Request, res: Response) => {
  try {
    const dates = await bookingRepository.getFullyBookedDates();
    res.status(200).json({ success: true, message: "OK", data: { dates } });
  } catch (error) {
    console.error("[GET /api/rooms/booked-dates]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
});

// GET /api/settings — public, returns check-in/check-out times
router.get("/settings", async (_req: Request, res: Response) => {
  try {
    const settings = await settingsRepository.getAll();
    res.status(200).json({ success: true, message: "OK", data: settings });
  } catch (error) {
    console.error("[GET /api/settings]", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
});

export default router;
