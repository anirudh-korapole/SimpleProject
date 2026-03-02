// Repository layer — only place that executes SQL for RoomBookings.

import { getPool, sql } from "../config/db";
import { RoomBooking } from "../types/room.types";

export class RoomBookingRepository {
  async create(entryId: number, roomNumber: string, numGuests: number): Promise<RoomBooking> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("entryId",    sql.Int,     entryId)
      .input("roomNumber", sql.NVarChar, roomNumber)
      .input("numGuests",  sql.Int,     numGuests)
      .query<RoomBooking>(
        `INSERT INTO RoomBookings (entryId, roomNumber, numGuests)
         OUTPUT INSERTED.id, INSERTED.entryId, INSERTED.roomNumber,
                INSERTED.numGuests, INSERTED.createdAt
         VALUES (@entryId, @roomNumber, @numGuests)`
      );

    return result.recordset[0];
  }
}
