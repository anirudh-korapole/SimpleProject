// Controller layer — handles HTTP request parsing and response formatting.
// It knows nothing about SQL; it delegates all work to the service layer.

import { Request, Response } from "express";
import { EntryService } from "../services/entry.service";
import { SubmitRequest, ApiResponse, Entry } from "../types/entry.types";

const entryService = new EntryService();

/**
 * POST /api/submit
 *
 * Flow:
 *  1. Parse the JSON body for { textValue }.
 *  2. Call EntryService.submitEntry() — validates + persists.
 *  3. Return 201 with the created entry on success.
 *  4. Return 400 for validation errors, 500 for unexpected errors.
 */
export async function submitEntry(req: Request, res: Response): Promise<void> {
  const { textValue } = req.body as SubmitRequest;

  try {
    const entry = await entryService.submitEntry(textValue);

    const response: ApiResponse<Entry> = {
      success: true,
      message: "Entry saved successfully",
      data: entry,
    };

    res.status(201).json(response);
  } catch (error) {
    const err = error as Error;

    // Validation errors coming from the service layer → 400 Bad Request
    if (err.message.includes("must not be empty")) {
      const response: ApiResponse = {
        success: false,
        message: err.message,
      };
      res.status(400).json(response);
      return;
    }

    // Unexpected errors (DB down, etc.) → 500 Internal Server Error
    console.error("[submitEntry]", err);
    const response: ApiResponse = {
      success: false,
      message: "An unexpected error occurred",
    };
    res.status(500).json(response);
  }
}
