// Repository layer — the ONLY place that talks to the database.
// No business logic lives here; it only executes queries.

import { getPool, sql } from "../config/db";
import { Entry } from "../types/entry.types";

export class EntryRepository {
  /**
   * Inserts a new text value into the Entries table and returns the created row.
   * Uses a parameterised query to prevent SQL injection.
   */
  async create(textValue: string, email: string): Promise<Entry> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("textValue", sql.NVarChar, textValue)
      .input("email", sql.NVarChar, email)
      .query<Entry>(
        `INSERT INTO Entries (textValue, email)
         OUTPUT INSERTED.id, INSERTED.textValue, INSERTED.email, INSERTED.createdAt
         VALUES (@textValue, @email)`
      );

    return result.recordset[0];
  }
}
