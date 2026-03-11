// Repository layer — the ONLY place that talks to the database.
// No business logic lives here; it only executes queries.

import { getPool, sql } from "../config/db";
import { Entry } from "../types/entry.types";

export class EntryRepository {
  /**
   * Inserts a new text value into the Entries table and returns the created row.
   * Uses a parameterised query to prevent SQL injection.
   */
  async create(textValue: string, email: string, phone: string): Promise<Entry> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("textValue", sql.NVarChar, textValue)
      .input("email", sql.NVarChar, email)
      .input("phone", sql.NVarChar(20), phone)
      .query<Entry>(
        `INSERT INTO Entries (textValue, email, phone)
         OUTPUT INSERTED.id, INSERTED.textValue, INSERTED.email, INSERTED.phone, INSERTED.createdAt
         VALUES (@textValue, @email, @phone)`
      );

    return result.recordset[0];
  }
}
