import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api/adminApi";

type FormStatus = "idle" | "loading" | "error";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const result = await adminLogin(username, password);

    if (result.success && result.data?.token) {
      localStorage.setItem("adminToken", result.data.token);
      navigate("/admin/dashboard");
    } else {
      setStatus("error");
      setErrorMessage(result.message || "Login failed");
    }
  };

  return (
    <div style={styles.card}>
      <h1 style={styles.heading}>Admin Login</h1>

      {status === "error" && (
        <div style={styles.errorBanner}>{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          disabled={status === "loading"}
          autoComplete="username"
        />
        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          disabled={status === "loading"}
          autoComplete="current-password"
        />
        <button type="submit" style={styles.button} disabled={status === "loading"}>
          {status === "loading" ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    maxWidth: 400,
    margin: "100px auto",
    padding: "2rem",
    borderRadius: 8,
    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
    fontFamily: "system-ui, sans-serif",
  },
  heading: { marginTop: 0, fontSize: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  label: { fontWeight: 600, fontSize: "0.95rem" },
  input: {
    padding: "0.6rem 0.75rem",
    fontSize: "1rem",
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.6rem 1.2rem",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    marginTop: "0.5rem",
  },
  errorBanner: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
    padding: "0.75rem 1rem",
    borderRadius: 4,
    marginBottom: "0.75rem",
  },
};

export default AdminLogin;
