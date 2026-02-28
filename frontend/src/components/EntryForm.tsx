import React, { useState } from "react";
import { submitEntry } from "../api/entryApi";
import { Entry } from "../types/api.types";

// Possible states the form can be in.
type FormStatus = "idle" | "loading" | "success" | "error";

const EntryForm: React.FC = () => {
  const [textValue, setTextValue] = useState<string>("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [savedEntry, setSavedEntry] = useState<Entry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  /**
   * Handle form submission:
   *  1. Prevent default page reload.
   *  2. Call the API layer (submitEntry).
   *  3. Update UI state based on the response.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic client-side guard — mirrors the server-side validation.
    if (!textValue.trim()) {
      setStatus("error");
      setErrorMessage("Please enter a value before submitting.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const result = await submitEntry(textValue);

    if (result.success && result.data) {
      setStatus("success");
      setSavedEntry(result.data);
      setTextValue(""); // clear the input after a successful save
    } else {
      setStatus("error");
      setErrorMessage(result.message || "Something went wrong.");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setSavedEntry(null);
    setErrorMessage("");
    setTextValue("");
  };

  return (
    <div style={styles.card}>
      <h1 style={styles.heading}>Submit an Entry</h1>

      {/* ── Success message ─────────────────────────────────────────────── */}
      {status === "success" && savedEntry && (
        <div style={{ ...styles.banner, ...styles.successBanner }}>
          <p>
            <strong>Saved!</strong> Your entry was stored with ID{" "}
            <code>{savedEntry.id}</code> at{" "}
            {new Date(savedEntry.createdAt).toLocaleString()}.
          </p>
          <button style={styles.linkButton} onClick={handleReset}>
            Submit another
          </button>
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
          <label htmlFor="textValue" style={styles.label}>
            Text Value
          </label>
          <input
            id="textValue"
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Enter some text…"
            style={styles.input}
            disabled={status === "loading"}
          />
          <button
            type="submit"
            style={styles.button}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Saving…" : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

// ── Inline styles (no extra dependencies needed) ──────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  card: {
    maxWidth: 480,
    margin: "80px auto",
    padding: "2rem",
    borderRadius: 8,
    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
    fontFamily: "system-ui, sans-serif",
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
  linkButton: {
    background: "none",
    border: "none",
    color: "#155724",
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
    fontSize: "inherit",
  },
};

export default EntryForm;
