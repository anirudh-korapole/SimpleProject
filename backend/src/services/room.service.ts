// Service layer — business logic for room bookings.

import { RoomBookingRepository } from "../repositories/room.repository";
import { RoomBooking } from "../types/room.types";

export class RoomBookingService {
  private repository: RoomBookingRepository;

  constructor() {
    this.repository = new RoomBookingRepository();
  }

  async createBooking(entryId: number, roomNumber: string, numGuests: number): Promise<RoomBooking> {
    if (!roomNumber || roomNumber.trim().length === 0) {
      throw new Error("roomNumber must not be empty");
    }

    if (!Number.isInteger(numGuests) || numGuests < 1) {
      throw new Error("numGuests must be a positive whole number");
    }

    return this.repository.create(entryId, roomNumber.trim(), numGuests);
  }
}
