// API layer — the single place responsible for talking to the backend.
// Keeps fetch logic out of components so it can be changed independently.

import { ApiResponse, Entry } from "../types/api.types";

/**
 * Sends textValue to POST /api/submit.
 *
 * Flow: form submit → submitEntry() → Express /api/submit
 *       → EntryController → EntryService → EntryRepository → SQL Server
 *       → response bubbles back here → component shows success message.
 */
export async function submitEntry(textValue: string): Promise<ApiResponse<Entry>> {
  const response = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ textValue }),
  });

  // Parse JSON regardless of status code so we can surface server error messages.
  const data: ApiResponse<Entry> = await response.json();
  return data;
}
