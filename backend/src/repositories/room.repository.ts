// Repository layer — only place that executes SQL for RoomBookings, BookingGuests and Rooms.

import { getPool, sql } from "../config/db";
import { RoomBooking, BookingGuest, GuestDetail, Room, CreateRoomRequest, AdminBookingView, RoomType, CreateRoomTypeRequest, RoomTypeAvailable } from "../types/room.types";

export class RoomTypeRepository {
  async getAll(): Promise<RoomType[]> {
    const pool = await getPool();
    const result = await pool.request().query<RoomType>(
      `SELECT * FROM RoomTypes ORDER BY name`
    );
    return result.recordset;
  }

  async create(data: CreateRoomTypeRequest): Promise<RoomType> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("name",        sql.NVarChar(100), data.name.trim())
      .input("description", sql.NVarChar(500), data.description?.trim() ?? null)
      .query<RoomType>(
        `INSERT INTO RoomTypes (name, description)
         OUTPUT INSERTED.*
         VALUES (@name, @description)`
      );
    return result.recordset[0];
  }

  async deleteById(id: number): Promise<void> {
    const pool = await getPool();
    await pool.request().input("id", sql.Int, id).query(`DELETE FROM RoomTypes WHERE id = @id`);
  }
}

export class RoomBookingRepository {
  async create(
    entryId: number,
    roomNumber: string,
    checkIn: string,
    checkOut: string,
    numGuests: number
  ): Promise<RoomBooking> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("entryId",    sql.Int,      entryId)
      .input("roomNumber", sql.NVarChar,  roomNumber)
      .input("numGuests",  sql.Int,       numGuests)
      .input("checkIn",    sql.Date,      checkIn)
      .input("checkOut",   sql.Date,      checkOut)
      .query<RoomBooking>(
        `INSERT INTO RoomBookings (entryId, roomNumber, numGuests, checkIn, checkOut)
         OUTPUT INSERTED.id, INSERTED.entryId, INSERTED.roomNumber,
                INSERTED.numGuests, INSERTED.checkIn, INSERTED.checkOut, INSERTED.createdAt
         VALUES (@entryId, @roomNumber, @numGuests, @checkIn, @checkOut)`
      );

    return result.recordset[0];
  }

  async createGuests(bookingId: number, guests: GuestDetail[]): Promise<void> {
    if (guests.length === 0) return;
    const pool = await getPool();

    for (const g of guests) {
      await pool
        .request()
        .input("bookingId",   sql.Int,          bookingId)
        .input("guestName",   sql.NVarChar(100), g.name)
        .input("guestAge",    sql.Int,           g.age)
        .input("guestGender", sql.NVarChar(20),  g.gender)
        .query(
          `INSERT INTO BookingGuests (bookingId, guestName, guestAge, guestGender)
           VALUES (@bookingId, @guestName, @guestAge, @guestGender)`
        );
    }
  }

  /** Returns room IDs that have overlapping bookings for the given date range. */
  async getUnavailableRoomIds(checkIn: string, checkOut: string): Promise<number[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("checkIn",  sql.Date, checkIn)
      .input("checkOut", sql.Date, checkOut)
      .query<{ id: number }>(
        `SELECT DISTINCT r.id
         FROM Rooms r
         WHERE r.isAvailable = 1
           AND EXISTS (
             SELECT 1 FROM RoomBookings rb
             WHERE rb.roomNumber = r.roomNumber
               AND rb.checkIn IS NOT NULL
               AND rb.checkIn  < @checkOut
               AND rb.checkOut > @checkIn
           )`
      );
    return result.recordset.map((r) => r.id);
  }

  /** Returns dates (next 180 days) where every available room is already booked. */
  async getFullyBookedDates(): Promise<string[]> {
    const pool = await getPool();
    const result = await pool.request().query<{ dt: Date }>(
      `DECLARE @totalRooms INT = (SELECT COUNT(*) FROM Rooms WHERE isAvailable = 1);
       DECLARE @today DATE = CAST(GETDATE() AS DATE);
       WITH n AS (
         SELECT TOP 180 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1 AS num
         FROM sys.all_columns
       ),
       dates AS (
         SELECT DATEADD(day, num, @today) AS dt FROM n
       )
       SELECT d.dt
       FROM dates d
       WHERE @totalRooms > 0
         AND (
           SELECT COUNT(DISTINCT rb.roomNumber)
           FROM RoomBookings rb
           WHERE rb.checkIn IS NOT NULL
             AND rb.checkIn  <= d.dt
             AND rb.checkOut >  d.dt
         ) >= @totalRooms
       ORDER BY d.dt`
    );
    return result.recordset.map((r) => {
      const d = new Date(r.dt);
      return d.toISOString().split("T")[0];
    });
  }
}

export class RoomRepository {
  async getAll(): Promise<Room[]> {
    const pool = await getPool();
    const result = await pool.request().query<Room>(
      `SELECT * FROM Rooms ORDER BY roomNumber`
    );
    return result.recordset;
  }

  async getAvailable(): Promise<Room[]> {
    const pool = await getPool();
    const result = await pool.request().query<Room>(
      `SELECT * FROM Rooms WHERE isAvailable = 1 ORDER BY roomNumber`
    );
    return result.recordset;
  }

  /** Returns room types that have at least one room available for the given date range,
   *  with amenities aggregated across rooms of each type. */
  async getAvailableRoomTypes(checkIn: string, checkOut: string): Promise<RoomTypeAvailable[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("checkIn",  sql.Date, checkIn)
      .input("checkOut", sql.Date, checkOut)
      .query<RoomTypeAvailable>(
        `SELECT rt.id, rt.name, rt.description,
                COUNT(r.id)                              AS availableCount,
                MAX(r.capacity)                          AS capacity,
                MAX(CAST(r.hasAC               AS INT))  AS hasAC,
                MAX(CAST(r.hasWifi             AS INT))  AS hasWifi,
                MAX(CAST(r.hasGeyser           AS INT))  AS hasGeyser,
                MAX(CAST(r.smokingAllowed      AS INT))  AS smokingAllowed,
                MAX(CAST(r.hasElectricityBackup AS INT)) AS hasElectricityBackup
         FROM RoomTypes rt
         JOIN Rooms r ON r.roomTypeId = rt.id
         WHERE r.isAvailable = 1
           AND NOT EXISTS (
             SELECT 1 FROM RoomBookings rb
             WHERE rb.roomNumber = r.roomNumber
               AND rb.checkIn  IS NOT NULL
               AND rb.checkIn  < @checkOut
               AND rb.checkOut > @checkIn
           )
         GROUP BY rt.id, rt.name, rt.description
         HAVING COUNT(r.id) > 0
         ORDER BY rt.name`
      );
    return result.recordset.map((r) => ({
      ...r,
      hasAC:               !!r.hasAC,
      hasWifi:             !!r.hasWifi,
      hasGeyser:           !!r.hasGeyser,
      smokingAllowed:      !!r.smokingAllowed,
      hasElectricityBackup:!!r.hasElectricityBackup,
    }));
  }

  /** Picks a random available room of the given type for the date range. Returns roomNumber. */
  async getRandomRoomForType(roomTypeId: number, checkIn: string, checkOut: string): Promise<string | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("roomTypeId", sql.Int,  roomTypeId)
      .input("checkIn",    sql.Date, checkIn)
      .input("checkOut",   sql.Date, checkOut)
      .query<{ roomNumber: string }>(
        `SELECT TOP 1 r.roomNumber
         FROM Rooms r
         WHERE r.roomTypeId = @roomTypeId
           AND r.isAvailable = 1
           AND NOT EXISTS (
             SELECT 1 FROM RoomBookings rb
             WHERE rb.roomNumber = r.roomNumber
               AND rb.checkIn  IS NOT NULL
               AND rb.checkIn  < @checkOut
               AND rb.checkOut > @checkIn
           )
         ORDER BY NEWID()`
      );
    return result.recordset[0]?.roomNumber ?? null;
  }

  async create(data: CreateRoomRequest): Promise<Room> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("roomNumber",          sql.NVarChar(20),  data.roomNumber.trim())
      .input("roomType",            sql.NVarChar(100), data.roomType?.trim() ?? null)
      .input("roomTypeId",          sql.Int,           data.roomTypeId ?? null)
      .input("capacity",            sql.Int,           data.capacity)
      .input("isAvailable",         sql.Bit,           data.isAvailable ?? true)
      .input("hasAC",               sql.Bit,           data.hasAC ?? false)
      .input("hasWifi",             sql.Bit,           data.hasWifi ?? false)
      .input("hasGeyser",           sql.Bit,           data.hasGeyser ?? false)
      .input("smokingAllowed",      sql.Bit,           data.smokingAllowed ?? false)
      .input("hasElectricityBackup",sql.Bit,           data.hasElectricityBackup ?? false)
      .input("toiletType",          sql.NVarChar(20),  data.toiletType)
      .input("bedType",             sql.NVarChar(20),  data.bedType)
      .query<Room>(
        `INSERT INTO Rooms
           (roomNumber, roomType, roomTypeId, capacity, isAvailable, hasAC, hasWifi, hasGeyser,
            smokingAllowed, hasElectricityBackup, toiletType, bedType)
         OUTPUT INSERTED.*
         VALUES (@roomNumber, @roomType, @roomTypeId, @capacity, @isAvailable, @hasAC, @hasWifi, @hasGeyser,
                 @smokingAllowed, @hasElectricityBackup, @toiletType, @bedType)`
      );

    return result.recordset[0];
  }

  async deleteById(id: number): Promise<void> {
    const pool = await getPool();
    await pool.request().input("id", sql.Int, id).query(`DELETE FROM Rooms WHERE id = @id`);
  }

  async updateAvailability(id: number, isAvailable: boolean): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input("id",          sql.Int, id)
      .input("isAvailable", sql.Bit, isAvailable)
      .query(`UPDATE Rooms SET isAvailable = @isAvailable WHERE id = @id`);
  }

  async getAllBookings(): Promise<AdminBookingView[]> {
    const pool = await getPool();
    const result = await pool.request().query<AdminBookingView>(
      `SELECT rb.id, rb.entryId, rb.roomNumber, rb.numGuests,
              rb.checkIn, rb.checkOut, rb.createdAt,
              e.textValue AS guestName, e.email, e.phone
       FROM RoomBookings rb
       JOIN Entries e ON rb.entryId = e.id
       ORDER BY rb.createdAt DESC`
    );
    return result.recordset;
  }
}
