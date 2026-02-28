// Service layer — contains all business logic.
// It sits between the controller (HTTP concerns) and the repository (data concerns).

import { EntryRepository } from "../repositories/entry.repository";
import { Entry } from "../types/entry.types";

export class EntryService {
  private repository: EntryRepository;

  constructor() {
    this.repository = new EntryRepository();
  }

  /**
   * Validates the input, then delegates persistence to the repository.
   * Throws a descriptive Error if validation fails so the controller
   * can translate it into the appropriate HTTP status code.
   */
  async submitEntry(textValue: string): Promise<Entry> {
    // Business rule: the value must be a non-empty string after trimming whitespace.
    if (!textValue || textValue.trim().length === 0) {
      throw new Error("textValue must not be empty");
    }

    // Persist and return the created entry.
    return this.repository.create(textValue.trim());
  }
}
