import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import entryRoutes from "./routes/entry.routes";
import roomRoutes from "./routes/room.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173" })); // Vite dev server default port
app.use(express.json());                             // Parse JSON request bodies

// ── Routes ────────────────────────────────────────────────────────────────────
// All entry-related routes are mounted under /api
app.use("/api", entryRoutes);
app.use("/api", roomRoutes);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
