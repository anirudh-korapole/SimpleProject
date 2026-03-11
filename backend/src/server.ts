import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import entryRoutes from "./routes/entry.routes";
import roomRoutes from "./routes/room.routes";
import adminRoutes from "./routes/admin.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"] }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", entryRoutes);
app.use("/api", roomRoutes);
app.use("/api/admin", adminRoutes);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
