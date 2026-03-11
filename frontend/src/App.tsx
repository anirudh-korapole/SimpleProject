import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./config/firebase";
import EntryForm from "./components/EntryForm";
import RoomBookingForm from "./components/RoomBookingForm";
import UserLogin from "./components/UserLogin";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { Entry } from "./types/api.types";

// ── Guest booking flow (protected) ───────────────────────────────────────────
const GuestFlow: React.FC = () => {
  const [submittedEntry, setSubmittedEntry] = useState<Entry | null>(null);

  return submittedEntry
    ? <RoomBookingForm entry={submittedEntry} onBack={() => setSubmittedEntry(null)} />
    : <EntryForm onSuccess={setSubmittedEntry} />;
};

// ── Root: show loading, then redirect based on auth ───────────────────────────
const ProtectedGuestFlow: React.FC<{ user: User | null; authReady: boolean }> = ({ user, authReady }) => {
  if (!authReady) return <div style={loadingStyle}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <GuestFlow />;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  return (
    <BrowserRouter>
      <div style={adminLinkStyle}>
        <Link to="/admin" style={linkStyle}>Admin</Link>
      </div>
      <Routes>
        <Route path="/" element={<ProtectedGuestFlow user={user} authReady={authReady} />} />
        <Route
          path="/login"
          element={
            authReady && user ? <Navigate to="/" replace /> : <UserLogin />
          }
        />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

const adminLinkStyle: React.CSSProperties = {
  position: "fixed",
  top: "0.75rem",
  right: "1rem",
  zIndex: 100,
};
const linkStyle: React.CSSProperties = { fontSize: "0.8rem", color: "#888", textDecoration: "none" };
const loadingStyle: React.CSSProperties = { margin: "100px auto", textAlign: "center", fontFamily: "system-ui, sans-serif", color: "#888" };

export default App;
