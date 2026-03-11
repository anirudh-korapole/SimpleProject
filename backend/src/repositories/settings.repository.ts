import { getPool, sql } from "../config/db";

export interface HotelSettings {
  checkInTime: string;  // HH:MM
  checkOutTime: string; // HH:MM
  is24Hour: boolean;
}

export class SettingsRepository {
  async getAll(): Promise<HotelSettings> {
    const pool = await getPool();
    const result = await pool
      .request()
      .query<{ key: string; value: string }>(
        `SELECT [key], [value] FROM Settings WHERE [key] IN ('checkInTime','checkOutTime','is24Hour')`
      );
    const map: Record<string, string> = {};
    result.recordset.forEach((r) => { map[r.key] = r.value; });
    return {
      checkInTime:  map["checkInTime"]  ?? "14:00",
      checkOutTime: map["checkOutTime"] ?? "11:00",
      is24Hour:     map["is24Hour"]     === "true",
    };
  }

  async set(key: string, value: string): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input("key",   sql.NVarChar(50),  key)
      .input("value", sql.NVarChar(200), value)
      .query(`UPDATE Settings SET [value] = @value WHERE [key] = @key`);
  }
}
