import React, { useState } from "react";
import { submitEntry } from "../api/entryApi";
import { Entry } from "../types/api.types";

type FormStatus = "idle" | "loading" | "error";

interface Props {
  onSuccess: (entry: Entry) => void; // called by App.tsx to advance to step 2
}

const EntryForm: React.FC<Props> = ({ onSuccess }) => {
  const [textValue, setTextValue] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!textValue.trim()) {
      setStatus("error");
      setErrorMessage("Please enter a name before submitting.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const result = await submitEntry(textValue, email);

    if (result.success && result.data) {
      // Hand the saved entry up to App.tsx — it will swap in the room booking form.
      onSuccess(result.data);
    } else {
      setStatus("error");
      setErrorMessage(result.message || "Something went wrong.");
    }
  };

  return (
    <div style={styles.card}>
      <p style={styles.step}>Step 1 of 2</p>
      <h1 style={styles.heading}>Your Details</h1>

      {status === "error" && (
        <div style={{ ...styles.banner, ...styles.errorBanner }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <label htmlFor="textValue" style={styles.label}>
          Name
        </label>
        <input
          id="textValue"
          type="text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder="Your name"
          style={styles.input}
          disabled={status === "loading"}
        />
        <label htmlFor="email" style={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={styles.input}
          disabled={status === "loading"}
        />
        <button
          type="submit"
          style={styles.button}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Saving…" : "Next →"}
        </button>
      </form>
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
  errorBanner: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
};

export default EntryForm;
