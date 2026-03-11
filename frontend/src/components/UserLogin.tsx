import React, { useRef, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";

type Phase = "phone" | "otp";
type Status = "idle" | "loading" | "error";

const UserLogin: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState<Phase>("phone");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your phone number.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      if (recaptchaVerifierRef.current) recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current!,
        { size: "normal" }
      );

      const result = await signInWithPhoneNumber(auth, phone.trim(), recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setPhase("otp");
      setStatus("idle");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || !confirmationResult) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      await confirmationResult.confirm(otp.trim());
      navigate("/");
    } catch {
      setStatus("error");
      setErrorMessage("Invalid OTP. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div style={styles.card}>
      <div ref={recaptchaContainerRef} />
      <h1 style={styles.heading}>Welcome</h1>
      <p style={styles.subtitle}>Enter your phone number to continue</p>

      {status === "error" && (
        <div style={styles.errorBanner}>{errorMessage}</div>
      )}

      {phase === "phone" && (
        <div style={styles.form}>
          <label style={styles.label}>Phone Number</label>
          <div style={styles.row}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              style={{ ...styles.input, flex: 1 }}
              disabled={status === "loading"}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
            />
            <button
              onClick={handleSendOtp}
              style={styles.button}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending…" : "Send OTP"}
            </button>
          </div>
        </div>
      )}

      {phase === "otp" && (
        <div style={styles.form}>
          <div style={styles.phoneRow}>
            <span style={styles.phoneDisplay}>{phone}</span>
            <button
              onClick={() => { setPhase("phone"); setOtp(""); setErrorMessage(""); setStatus("idle"); }}
              style={styles.changeLink}
            >
              Change
            </button>
          </div>
          <label style={styles.label}>OTP</label>
          <div style={styles.row}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              style={{ ...styles.input, flex: 1 }}
              disabled={status === "loading"}
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
            />
            <button
              onClick={handleVerifyOtp}
              style={styles.button}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Verifying…" : "Verify"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    maxWidth: 420,
    margin: "100px auto",
    padding: "2rem",
    borderRadius: 8,
    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
    fontFamily: "system-ui, sans-serif",
  },
  heading: { marginTop: 0, fontSize: "1.75rem" },
  subtitle: { color: "#666", marginTop: 0, marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  label: { fontWeight: 600 },
  row: { display: "flex", gap: "0.5rem", alignItems: "center" },
  input: {
    padding: "0.6rem 0.75rem",
    fontSize: "1rem",
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.6rem 1rem",
    fontSize: "0.95rem",
    cursor: "pointer",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    whiteSpace: "nowrap",
  },
  phoneRow: { display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" },
  phoneDisplay: { fontWeight: 500 },
  changeLink: {
    background: "none",
    border: "none",
    color: "#0070f3",
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: 0,
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

export default UserLogin;
