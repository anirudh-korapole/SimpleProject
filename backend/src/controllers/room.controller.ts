// Controller layer — handles HTTP for room bookings.

import { Request, Response } from "express";
import { RoomBookingService } from "../services/room.service";
import { CreateRoomBookingRequest, ApiResponse, RoomBooking } from "../types/room.types";

const roomBookingService = new RoomBookingService();

/**
 * POST /api/room-booking
 *
 * Flow:
 *  1. Parse { entryId, roomNumber, numGuests } from body.
 *  2. Call RoomBookingService.createBooking() — validates + persists.
 *  3. Return 201 with the created booking on success.
 *  4. Return 400 for validation errors, 500 for unexpected errors.
 */
export async function createRoomBooking(req: Request, res: Response): Promise<void> {
  const { entryId, roomNumber, numGuests } = req.body as CreateRoomBookingRequest;

  try {
    // Parse numGuests to int in case it arrives as a string from the form.
    const guests = typeof numGuests === "string" ? parseInt(numGuests, 10) : numGuests;

    const booking = await roomBookingService.createBooking(entryId, roomNumber, guests);

    const response: ApiResponse<RoomBooking> = {
      success: true,
      message: "Room booked successfully",
      data: booking,
    };

    res.status(201).json(response);
  } catch (error) {
    const err = error as Error;

    if (err.message.includes("must not be empty") || err.message.includes("must be a positive")) {
      const response: ApiResponse = { success: false, message: err.message };
      res.status(400).json(response);
      return;
    }

    console.error("[createRoomBooking]", err);
    const response: ApiResponse = { success: false, message: "An unexpected error occurred" };
    res.status(500).json(response);
  }
}
