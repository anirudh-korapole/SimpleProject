import { Router } from "express";
import { createRoomBooking } from "../controllers/room.controller";

const router = Router();

// POST /api/room-booking  →  RoomBookingController.createRoomBooking
router.post("/room-booking", createRoomBooking);

export default router;
