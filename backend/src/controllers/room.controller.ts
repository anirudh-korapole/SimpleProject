import { Request, Response } from "express";
import { RoomBookingService } from "../services/room.service";
import { CreateRoomBookingRequest, ApiResponse, RoomBooking } from "../types/room.types";

const roomBookingService = new RoomBookingService();

export async function createRoomBooking(req: Request, res: Response): Promise<void> {
  const { entryId, roomTypeId, checkIn, checkOut, guests } = req.body as CreateRoomBookingRequest;

  try {
    const booking = await roomBookingService.createBooking(
      entryId,
      roomTypeId,
      checkIn,
      checkOut,
      guests ?? []
    );

    const response: ApiResponse<RoomBooking> = {
      success: true,
      message: "Room booked successfully",
      data: booking,
    };

    res.status(201).json(response);
  } catch (error) {
    const err = error as Error;

    const clientErrors = ["must not be empty", "must be a positive", "required", "cannot be in the past", "must be after", "Invalid dates", "age must be", "No rooms available"];
    if (clientErrors.some((s) => err.message.includes(s))) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }

    console.error("[createRoomBooking]", err);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}
