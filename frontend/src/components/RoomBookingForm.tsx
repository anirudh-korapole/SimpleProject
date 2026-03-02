import React, { useState } from "react";
import { createRoomBooking } from "../api/roomApi";
import { Entry, RoomBooking } from "../types/api.types";

interface Props {
  entry: Entry; // the entry created in step 1 — name + email shown read-only
}

type FormStatus = "idle" | "loading" | "success" | "error";

const RoomBookingForm: React.FC<Props> = ({ entry }) => {
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [numGuests, setNumGuests] = useState<string>("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [savedBooking, setSavedBooking] = useState<RoomBooking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!roomNumber.trim()) {
      setStatus("error");
      setErrorMessage("Please enter a room number.");
      return;
    }

    const guests = parseInt(numGuests, 10);
    if (!numGuests.trim() || isNaN(guests) || guests < 1 || !Number.isInteger(guests)) {
      setStatus("error");
      setErrorMessage("Please enter a valid number of guests (1 or more).");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const result = await createRoomBooking(entry.id, roomNumber, guests);

    if (result.success && result.data) {
      setStatus("success");
      setSavedBooking(result.data);
    } else {
      setStatus("error");
      setErrorMessage(result.message || "Something went wrong.");
    }
  };

  return (
    <div style={styles.card}>
      {/* Step indicator */}
      <p style={styles.step}>Step 2 of 2</p>
      <h1 style={styles.heading}>Room Selection</h1>

      {/* Read-only summary from step 1 */}
      <div style={styles.summary}>
        <span style={styles.summaryLabel}>Name:</span> {entry.textValue}
        <br />
        <span style={styles.summaryLabel}>Email:</span> {entry.email}
      </div>

      {/* ── Success message ─────────────────────────────────────────────── */}
      {status === "success" && savedBooking && (
        <div style={{ ...styles.banner, ...styles.successBanner }}>
          <strong>Booking confirmed!</strong>
          <ul style={styles.confirmList}>
            <li>Name: {entry.textValue}</li>
            <li>Email: {entry.email}</li>
            <li>Room: {savedBooking.roomNumber}</li>
            <li>Guests: {savedBooking.numGuests}</li>
            <li>Booked at: {new Date(savedBooking.createdAt).toLocaleString()}</li>
          </ul>
        </div>
      )}

      {/* ── Error message ────────────────────────────────────────────────── */}
      {status === "error" && (
        <div style={{ ...styles.banner, ...styles.errorBanner }}>
          {errorMessage}
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      {status !== "success" && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <label htmlFor="roomNumber" style={styles.label}>
            Room Number
          </label>
          <input
            id="roomNumber"
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. 101"
            style={styles.input}
            disabled={status === "loading"}
          />
          <label htmlFor="numGuests" style={styles.label}>
            Number of Guests
          </label>
          <input
            id="numGuests"
            type="number"
            min={1}
            value={numGuests}
            onChange={(e) => setNumGuests(e.target.value)}
            placeholder="e.g. 2"
            style={styles.input}
            disabled={status === "loading"}
          />
          <button
            type="submit"
            style={styles.button}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Booking…" : "Book Room"}
          </button>
        </form>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    maxWidth: 480,
    margin: "80px auto",
    padding: "2rem",
    borderRadius: 8,
    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
    fontFamily: "system-ui, sans-serif",
  },
  step: {
    margin: "0 0 0.25rem",
    fontSize: "0.8rem",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  heading: {
    marginTop: 0,
    fontSize: "1.5rem",
  },
  summary: {
    backgroundColor: "#f5f5f5",
    border: "1px solid #e0e0e0",
    borderRadius: 4,
    padding: "0.6rem 0.75rem",
    marginBottom: "1rem",
    fontSize: "0.9rem",
    lineHeight: 1.6,
  },
  summaryLabel: {
    fontWeight: 600,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  label: {
    fontWeight: 600,
  },
  input: {
    padding: "0.6rem 0.75rem",
    fontSize: "1rem",
    borderRadius: 4,
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: "0.6rem 1.2rem",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  banner: {
    padding: "0.75rem 1rem",
    borderRadius: 4,
    marginBottom: "0.5rem",
  },
  successBanner: {
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  errorBanner: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  confirmList: {
    margin: "0.5rem 0 0",
    paddingLeft: "1.25rem",
  },
};

export default RoomBookingForm;
