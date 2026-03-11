import { RoomBookingRepository, RoomRepository } from "../repositories/room.repository";
import { RoomBooking, GuestDetail } from "../types/room.types";

export class RoomBookingService {
  private bookingRepo: RoomBookingRepository;
  private roomRepo: RoomRepository;

  constructor() {
    this.bookingRepo = new RoomBookingRepository();
    this.roomRepo = new RoomRepository();
  }

  async createBooking(
    entryId: number,
    roomTypeId: number,
    checkIn: string,
    checkOut: string,
    guests: GuestDetail[]
  ): Promise<RoomBooking> {
    if (!checkIn || !checkOut) throw new Error("checkIn and checkOut are required");

    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(ci.getTime()) || isNaN(co.getTime())) throw new Error("Invalid dates");
    if (ci < today) throw new Error("checkIn cannot be in the past");
    if (co <= ci)   throw new Error("checkOut must be after checkIn");

    if (!guests || guests.length === 0) throw new Error("At least one guest is required");
    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      if (!g.name?.trim()) throw new Error(`Guest ${i + 1}: name is required`);
      if (!Number.isInteger(g.age) || g.age < 1 || g.age > 120)
        throw new Error(`Guest ${i + 1}: age must be between 1 and 120`);
    }

    // Pick a random available room of the requested type
    const roomNumber = await this.roomRepo.getRandomRoomForType(roomTypeId, checkIn, checkOut);
    if (!roomNumber) throw new Error("No rooms available for the selected type and dates");

    const booking = await this.bookingRepo.create(entryId, roomNumber, checkIn, checkOut, guests.length);
    await this.bookingRepo.createGuests(booking.id, guests);
    return booking;
  }
}
