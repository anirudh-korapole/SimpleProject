import React, { useEffect, useState } from "react";
import { AdminBookingView } from "../types/api.types";
import { adminGetBookings } from "../api/adminApi";

const BookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminGetBookings().then((res) => {
      if (res.success && res.data) {
        setBookings(res.data);
      } else {
        setError(res.message || "Failed to load bookings");
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading bookings…</p>;
  if (error) return <p style={{ color: "#721c24" }}>{error}</p>;
  if (bookings.length === 0) return <p>No bookings yet.</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            {["Guest Name", "Email", "Phone", "Room", "Guests", "Check-in", "Check-out", "Booked At"].map((h) => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td style={styles.td}>{b.guestName}</td>
              <td style={styles.td}>{b.email}</td>
              <td style={styles.td}>{b.phone}</td>
              <td style={styles.td}>{b.roomNumber}</td>
              <td style={styles.td}>{b.numGuests}</td>
              <td style={styles.td}>{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "—"}</td>
              <td style={styles.td}>{b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "—"}</td>
              <td style={styles.td}>{new Date(b.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th: {
    textAlign: "left",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#f0f0f0",
    borderBottom: "2px solid #ddd",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "0.5rem 0.75rem",
    borderBottom: "1px solid #eee",
  },
};

export default BookingsList;
