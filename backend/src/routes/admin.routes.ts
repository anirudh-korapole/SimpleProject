import { Router } from "express";
import { authenticateAdmin } from "../middleware/auth.middleware";
import {
  login,
  getRooms,
  createRoom,
  deleteRoom,
  updateAvailability,
  getBookings,
  getRoomTypes,
  createRoomType,
  deleteRoomType,
  getSettings,
  updateSettings,
} from "../controllers/admin.controller";

const router = Router();

// Public
router.post("/login", login);

// Protected
router.get("/rooms",                        authenticateAdmin, getRooms);
router.post("/rooms",                       authenticateAdmin, createRoom);
router.delete("/rooms/:id",                 authenticateAdmin, deleteRoom);
router.patch("/rooms/:id/availability",     authenticateAdmin, updateAvailability);
router.get("/bookings",                     authenticateAdmin, getBookings);
router.get("/room-types",                   authenticateAdmin, getRoomTypes);
router.post("/room-types",                  authenticateAdmin, createRoomType);
router.delete("/room-types/:id",            authenticateAdmin, deleteRoomType);
router.get("/settings",                     authenticateAdmin, getSettings);
router.patch("/settings",                   authenticateAdmin, updateSettings);

export default router;
