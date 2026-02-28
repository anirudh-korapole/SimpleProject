// Repository layer — the ONLY place that talks to the database.
// No business logic lives here; it only executes queries.

import { getPool, sql } from "../config/db";
import { Entry } from "../types/entry.types";

export class EntryRepository {
  /**
   * Inserts a new text value into the Entries table and returns the created row.
   * Uses a parameterised query to prevent SQL injection.
   */
  async create(textValue: string): Promise<Entry> {
    const pool = await getPool();

    // OUTPUT INSERTED.* returns the full row that was just written,
    // including the auto-generated id and default createdAt.
    const result = await pool
      .request()
      .input("textValue", sql.NVarChar, textValue)
      .query<Entry>(
        `INSERT INTO Entries (textValue)
         OUTPUT INSERTED.id, INSERTED.textValue, INSERTED.createdAt
         VALUES (@textValue)`
      );

    return result.recordset[0];
  }
}
