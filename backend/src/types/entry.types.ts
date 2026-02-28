// Shared TypeScript interfaces used across all layers.

/** Shape of the JSON body expected by POST /api/submit */
export interface SubmitRequest {
  textValue: string;
}

/** A row from the Entries table */
export interface Entry {
  id: number;
  textValue: string;
  createdAt: Date;
}

/** Standard API response envelope */
export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}
