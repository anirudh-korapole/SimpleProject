import { Router } from "express";
import { submitEntry } from "../controllers/entry.controller";

const router = Router();

// POST /api/submit  →  EntryController.submitEntry
router.post("/submit", submitEntry);

export default router;
