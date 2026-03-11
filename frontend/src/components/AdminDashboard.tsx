import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomManagement from "./RoomManagement";
import RoomTypeManagement from "./RoomTypeManagement";
import BookingsList from "./BookingsList";
import HotelSettingsPanel from "./HotelSettings";

type Tab = "rooms" | "roomTypes" | "bookings" | "settings";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("rooms");
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("rooms")}
          style={{ ...styles.tab, ...(activeTab === "rooms" ? styles.activeTab : {}) }}
        >
          Rooms
        </button>
        <button
          onClick={() => setActiveTab("roomTypes")}
          style={{ ...styles.tab, ...(activeTab === "roomTypes" ? styles.activeTab : {}) }}
        >
          Room Types
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          style={{ ...styles.tab, ...(activeTab === "bookings" ? styles.activeTab : {}) }}
        >
          Bookings
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          style={{ ...styles.tab, ...(activeTab === "settings" ? styles.activeTab : {}) }}
        >
          Settings
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === "rooms"     && <RoomManagement />}
        {activeTab === "roomTypes" && <RoomTypeManagement />}
        {activeTab === "bookings"  && <BookingsList />}
        {activeTab === "settings"  && <HotelSettingsPanel />}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "1.5rem",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: { margin: 0, fontSize: "1.75rem" },
  logoutBtn: {
    padding: "0.4rem 1rem",
    fontSize: "0.9rem",
    cursor: "pointer",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: 4,
  },
  tabs: { display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #ddd", paddingBottom: "0" },
  tab: {
    padding: "0.5rem 1.2rem",
    fontSize: "0.95rem",
    cursor: "pointer",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px",
    color: "#555",
  },
  activeTab: {
    borderBottom: "2px solid #0070f3",
    color: "#0070f3",
    fontWeight: 600,
  },
  content: { paddingTop: "0.5rem" },
};

export default AdminDashboard;
