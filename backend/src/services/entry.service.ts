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
  async submitEntry(textValue: string, email: string): Promise<Entry> {
    if (!textValue || textValue.trim().length === 0) {
      throw new Error("textValue must not be empty");
    }

    if (!email || email.trim().length === 0) {
      throw new Error("email must not be empty");
    }

    // Basic email format check.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error("email is not valid");
    }

    return this.repository.create(textValue.trim(), email.trim());
  }
}
