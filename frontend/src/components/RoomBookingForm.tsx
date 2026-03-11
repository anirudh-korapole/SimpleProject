import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createRoomBooking, getAvailableRoomTypes, getFullyBookedDates, getHotelSettings } from "../api/roomApi";
import { Entry, RoomBooking, GuestDetail, RoomTypeAvailable, HotelSettings } from "../types/api.types";

interface Props {
  entry: Entry;
  onBack: () => void;
}

type Step = "dates" | "room" | "guests" | "success";

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const fmt12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

// 30-minute interval options: 00:00, 00:30, 01:00, … 23:30
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const AMENITY_KEYS: Array<{ key: keyof RoomTypeAvailable; label: string; icon: string }> = [
  { key: "hasAC",                label: "AC",               icon: "❄️" },
  { key: "hasWifi",              label: "WiFi",             icon: "📶" },
  { key: "hasGeyser",            label: "Geyser",           icon: "🚿" },
  { key: "smokingAllowed",       label: "Smoking",          icon: "🚬" },
  { key: "hasElectricityBackup", label: "24/7 Electricity", icon: "⚡" },
];

// ── Room Type Card ─────────────────────────────────────────────────────────────
const RoomTypeCard: React.FC<{
  rt: RoomTypeAvailable;
  selected: boolean;
  onSelect: () => void;
}> = ({ rt, selected, onSelect }) => {
  const amenities = AMENITY_KEYS.filter((a) => rt[a.key] as boolean);
  return (
    <div
      onClick={onSelect}
      style={{
        border: selected ? "2px solid #0070f3" : "1px solid #ddd",
        borderRadius: 10,
        padding: "1.1rem 1.2rem",
        cursor: "pointer",
        backgroundColor: selected ? "#f0f7ff" : "#fff",
        boxShadow: selected ? "0 0 0 3px rgba(0,112,243,0.15)" : "0 1px 4px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.15s, border-color 0.15s",
        position: "relative",
      }}
    >
      {selected && <span style={cardStyles.selectedBadge}>Selected ✓</span>}
      <h3 style={{ margin: 0, fontSize: "1.15rem" }}>{rt.name}</h3>
      {rt.description && (
        <p style={{ margin: "0.3rem 0 0.6rem", color: "#555", fontSize: "0.88rem" }}>{rt.description}</p>
      )}
      <div style={cardStyles.metaRow}>
        <span style={cardStyles.metaChip}>👥 Up to {rt.capacity} pax</span>
      </div>
      {amenities.length > 0 ? (
        <div style={cardStyles.amenitiesRow}>
          {amenities.map((a) => (
            <span key={a.key as string} style={cardStyles.amenityTag}>{a.icon} {a.label}</span>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: "0.82rem", color: "#aaa" }}>No amenities listed</p>
      )}
    </div>
  );
};

const cardStyles: Record<string, React.CSSProperties> = {
  selectedBadge: { position: "absolute", top: "0.6rem", right: "0.75rem", fontSize: "0.72rem", backgroundColor: "#d4edda", color: "#155724", borderRadius: 4, padding: "0.15rem 0.5rem", fontWeight: 600 },
  metaRow:       { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.6rem" },
  metaChip:      { backgroundColor: "#f5f5f5", borderRadius: 4, padding: "0.2rem 0.5rem", fontSize: "0.82rem", color: "#444" },
  amenitiesRow:  { display: "flex", flexWrap: "wrap", gap: "0.35rem" },
  amenityTag:    { backgroundColor: "#e8f4fd", color: "#0070f3", borderRadius: 4, padding: "0.18rem 0.5rem", fontSize: "0.78rem", fontWeight: 500 },
};

// ── Main Component ─────────────────────────────────────────────────────────────
const RoomBookingForm: React.FC<Props> = ({ entry, onBack }) => {
  const [step, setStep] = useState<Step>("dates");

  const [hotelSettings, setHotelSettings] = useState<HotelSettings>({
    checkInTime: "14:00", checkOutTime: "11:00", is24Hour: false,
  });

  // Date step
  const [checkIn, setCheckIn]   = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("14:00"); // 24hr mode only
  const [fullyBookedDates, setFullyBookedDates] = useState<Date[]>([]);

  // Room type step
  const [roomTypes, setRoomTypes]               = useState<RoomTypeAvailable[]>([]);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomTypeAvailable | null>(null);
  const [amenityFilters, setAmenityFilters]     = useState<Set<keyof RoomTypeAvailable>>(new Set());

  // Guest step
  const [numGuests, setNumGuests] = useState(1);
  const [guests, setGuests]       = useState<Array<{ name: string; age: string; gender: string }>>([
    { name: "", age: "", gender: "male" },
  ]);
  const [submitting, setSubmitting]     = useState(false);
  const [savedBooking, setSavedBooking] = useState<RoomBooking | null>(null);
  const [error, setError]               = useState("");

  useEffect(() => {
    getFullyBookedDates().then(setFullyBookedDates);
    getHotelSettings().then(setHotelSettings);
  }, []);

  useEffect(() => {
    setGuests((prev) => {
      const copy = [...prev];
      while (copy.length < numGuests) copy.push({ name: "", age: "", gender: "male" });
      return copy.slice(0, numGuests);
    });
  }, [numGuests]);

  // In 24hr mode: checkOut is always checkIn + 1 day
  const effectiveCheckOut = hotelSettings.is24Hour && checkIn ? addDays(checkIn, 1) : checkOut;

  const handleDatesNext = () => {
    if (!checkIn) { setError("Please select a check-in date."); return; }
    if (!hotelSettings.is24Hour && !checkOut) { setError("Please select both check-in and check-out dates."); return; }
    setError("");
    const ciStr = toDateStr(checkIn);
    const coStr = toDateStr(effectiveCheckOut!);
    setLoadingRoomTypes(true);
    getAvailableRoomTypes(ciStr, coStr)
      .then((res) => {
        setRoomTypes(res.data ?? []);
        setSelectedRoomType(null);
        setAmenityFilters(new Set());
        setStep("room");
      })
      .finally(() => setLoadingRoomTypes(false));
  };

  const toggleAmenityFilter = (key: keyof RoomTypeAvailable) => {
    setAmenityFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filteredRoomTypes = roomTypes.filter((rt) =>
    [...amenityFilters].every((key) => rt[key] === true)
  );

  const handleRoomTypeSelect = (rt: RoomTypeAvailable) => {
    setSelectedRoomType(rt);
    setNumGuests(1);
    setGuests([{ name: "", age: "", gender: "male" }]);
    setStep("guests");
  };

  const handleGuestChange = (i: number, field: "name" | "age" | "gender", value: string) => {
    setGuests((prev) => prev.map((g, idx) => (idx === i ? { ...g, [field]: value } : g)));
  };

  const handleSubmit = async () => {
    setError("");
    for (let i = 0; i < guests.length; i++) {
      if (!guests[i].name.trim()) { setError(`Guest ${i + 1}: name is required.`); return; }
      const age = parseInt(guests[i].age, 10);
      if (isNaN(age) || age < 1 || age > 120) { setError(`Guest ${i + 1}: enter a valid age (1–120).`); return; }
    }
    setSubmitting(true);
    const result = await createRoomBooking({
      entryId:    entry.id,
      roomTypeId: selectedRoomType!.id,
      checkIn:    toDateStr(checkIn!),
      checkOut:   toDateStr(effectiveCheckOut!),
      guests:     guests.map((g) => ({ name: g.name.trim(), age: parseInt(g.age, 10), gender: g.gender })),
    });
    setSubmitting(false);
    if (result.success && result.data) {
      setSavedBooking(result.data);
      setStep("success");
    } else {
      setError(result.message || "Something went wrong.");
    }
  };

  const nightCount = checkIn && effectiveCheckOut
    ? Math.round((effectiveCheckOut.getTime() - checkIn.getTime()) / 86400000)
    : 0;

  const checkoutDisplay = effectiveCheckOut
    ? (hotelSettings.is24Hour
        ? `${effectiveCheckOut.toLocaleDateString()} at ${fmt12(selectedTime)}`
        : effectiveCheckOut.toLocaleDateString())
    : "—";

  return (
    <div style={styles.card}>
      <p style={styles.stepLabel}>Step 2 of 2</p>
      <button onClick={onBack} style={styles.backBtn}>← Back</button>
      <h1 style={styles.heading}>Room Booking</h1>

      <div style={styles.summary}>
        <span style={styles.summaryLabel}>Name:</span> {entry.textValue}
        {"  ·  "}
        <span style={styles.summaryLabel}>Email:</span> {entry.email}
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* ── SUCCESS ──────────────────────────────────────────────────── */}
      {step === "success" && savedBooking && (
        <div style={styles.successBanner}>
          <strong>Booking confirmed!</strong>
          <ul style={styles.confirmList}>
            <li>Room type: {selectedRoomType?.name}</li>
            <li>Assigned room: {savedBooking.roomNumber}</li>
            <li>
              Check-in: {savedBooking.checkIn
                ? (hotelSettings.is24Hour
                    ? `${new Date(savedBooking.checkIn).toLocaleDateString()} at ${fmt12(selectedTime)}`
                    : `${new Date(savedBooking.checkIn).toLocaleDateString()} at ${fmt12(hotelSettings.checkInTime)}`)
                : "—"}
            </li>
            <li>
              Check-out: {savedBooking.checkOut
                ? (hotelSettings.is24Hour
                    ? `${new Date(savedBooking.checkOut).toLocaleDateString()} at ${fmt12(selectedTime)}`
                    : `${new Date(savedBooking.checkOut).toLocaleDateString()} by ${fmt12(hotelSettings.checkOutTime)}`)
                : "—"}
            </li>
            <li>Guests: {savedBooking.numGuests}</li>
            <li>Booked at: {new Date(savedBooking.createdAt).toLocaleString()}</li>
          </ul>
        </div>
      )}

      {/* ── STEP: DATES ──────────────────────────────────────────────── */}
      {step === "dates" && (
        <div style={styles.section}>
          <h2 style={styles.sectionHeading}>
            {hotelSettings.is24Hour ? "Select Check-in Date & Time" : "Select Dates"}
          </h2>

          {/* Fixed times bar — only shown in normal mode */}
          {!hotelSettings.is24Hour && (
            <div style={styles.timesBar}>
              <span>🏨 Check-in from <strong>{fmt12(hotelSettings.checkInTime)}</strong></span>
              <span style={styles.timesDivider}>|</span>
              <span>🚪 Check-out by <strong>{fmt12(hotelSettings.checkOutTime)}</strong></span>
            </div>
          )}

          <p style={styles.hint}>Dates highlighted in grey are fully booked.</p>

          {hotelSettings.is24Hour ? (
            /* ── 24hr mode: date + time side by side ── */
            <div style={styles.twentyFourLayout}>
              <div>
                <p style={styles.colLabel}>1. Pick your check-in date</p>
                <DatePicker
                  selected={checkIn}
                  onChange={(date: Date | null) => setCheckIn(date)}
                  inline
                  minDate={new Date()}
                  excludeDates={fullyBookedDates}
                />
              </div>
              <div style={styles.timeColumn}>
                <p style={styles.colLabel}>2. Pick your check-in time</p>
                <div style={styles.timeListWrap}>
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      style={{
                        ...styles.timeSlot,
                        ...(selectedTime === t ? styles.timeSlotActive : {}),
                      }}
                    >
                      {fmt12(t)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.summaryColumn}>
                <p style={styles.colLabel}>Summary</p>
                <div style={styles.twentyFourSummary}>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryIcon}>🏨</span>
                    <div>
                      <div style={styles.summaryRowLabel}>Check-in</div>
                      <div style={styles.summaryRowValue}>
                        {checkIn ? checkIn.toLocaleDateString() : <span style={{ color: "#aaa" }}>Select a date</span>}
                      </div>
                      <div style={styles.summaryRowValue}>{fmt12(selectedTime)}</div>
                    </div>
                  </div>
                  <div style={styles.summaryDivider} />
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryIcon}>🚪</span>
                    <div>
                      <div style={styles.summaryRowLabel}>Check-out</div>
                      <div style={styles.summaryRowValue}>
                        {checkIn ? addDays(checkIn, 1).toLocaleDateString() : <span style={{ color: "#aaa" }}>—</span>}
                      </div>
                      <div style={styles.summaryRowValue}>{fmt12(selectedTime)}</div>
                    </div>
                  </div>
                  <p style={styles.twentyFourNote}>24-hour stay</p>
                </div>
              </div>
            </div>
          ) : (
            /* ── Normal mode: range picker ── */
            <>
              <div style={styles.datePickerWrap}>
                <DatePicker
                  selected={checkIn}
                  onChange={(dates) => {
                    const [start, end] = dates as [Date | null, Date | null];
                    setCheckIn(start);
                    setCheckOut(end);
                  }}
                  startDate={checkIn}
                  endDate={checkOut}
                  selectsRange
                  inline
                  minDate={new Date()}
                  excludeDates={fullyBookedDates}
                  monthsShown={2}
                />
              </div>
              {checkIn && checkOut && (
                <p style={styles.dateConfirm}>
                  {checkIn.toLocaleDateString()} → {checkOut.toLocaleDateString()} &nbsp;
                  <strong>({nightCount} night{nightCount !== 1 ? "s" : ""})</strong>
                </p>
              )}
            </>
          )}

          <button
            onClick={handleDatesNext}
            style={{
              ...styles.btn,
              marginTop: "1.25rem",
              ...(!checkIn || (!hotelSettings.is24Hour && !checkOut) || loadingRoomTypes
                ? styles.btnDisabled : {}),
            }}
            disabled={!checkIn || (!hotelSettings.is24Hour && !checkOut) || loadingRoomTypes}
          >
            {loadingRoomTypes ? "Loading rooms…" : "Select Room Type →"}
          </button>
        </div>
      )}

      {/* ── STEP: ROOM TYPE ──────────────────────────────────────────── */}
      {step === "room" && (
        <div style={styles.section}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <h2 style={{ ...styles.sectionHeading, margin: 0 }}>Choose a Room Type</h2>
            <button onClick={() => { setStep("dates"); setSelectedRoomType(null); }} style={styles.textBtn}>
              ← Change dates
            </button>
          </div>
          <p style={styles.hint}>
            {checkIn?.toLocaleDateString()} → {effectiveCheckOut?.toLocaleDateString()}
            {hotelSettings.is24Hour
              ? ` · Check-in at ${fmt12(selectedTime)}`
              : ` · ${nightCount} night${nightCount !== 1 ? "s" : ""}`}
          </p>

          <div style={styles.filterBar}>
            <span style={styles.filterLabel}>Filter by amenity:</span>
            {AMENITY_KEYS.map((a) => {
              const active = amenityFilters.has(a.key);
              return (
                <button
                  key={a.key as string}
                  onClick={() => toggleAmenityFilter(a.key)}
                  style={{ ...styles.filterChip, ...(active ? styles.filterChipActive : {}) }}
                >
                  {a.icon} {a.label}
                </button>
              );
            })}
            {amenityFilters.size > 0 && (
              <button onClick={() => setAmenityFilters(new Set())} style={styles.clearBtn}>
                Clear filters
              </button>
            )}
          </div>

          {filteredRoomTypes.length === 0 ? (
            <p style={styles.hint}>
              {roomTypes.length === 0
                ? "No room types are available for these dates."
                : "No room types match the selected filters."}
            </p>
          ) : (
            <div style={styles.cardGrid}>
              {filteredRoomTypes.map((rt) => (
                <RoomTypeCard
                  key={rt.id}
                  rt={rt}
                  selected={selectedRoomType?.id === rt.id}
                  onSelect={() => handleRoomTypeSelect(rt)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STEP: GUESTS ─────────────────────────────────────────────── */}
      {step === "guests" && selectedRoomType && (
        <div style={styles.section}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
            <h2 style={{ ...styles.sectionHeading, margin: 0 }}>Guest Details</h2>
            <button onClick={() => setStep("room")} style={styles.textBtn}>← Change room type</button>
          </div>

          <div style={styles.selectedRoomSummary}>
            <strong>{selectedRoomType.name}</strong>
            {selectedRoomType.description && (
              <span style={{ color: "#555" }}> — {selectedRoomType.description}</span>
            )}
            <span style={{ color: "#888" }}> · up to {selectedRoomType.capacity} pax</span>
            <br />
            <span style={{ fontSize: "0.85rem", color: "#555" }}>
              {checkIn?.toLocaleDateString()} → {checkoutDisplay}
            </span>
          </div>

          <label style={styles.label}>Number of Guests</label>
          <select
            value={numGuests}
            onChange={(e) => setNumGuests(parseInt(e.target.value, 10))}
            style={{ ...styles.input, width: 100, marginBottom: "1.25rem" }}
          >
            {Array.from({ length: selectedRoomType.capacity }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          {guests.map((g, i) => (
            <div key={i} style={styles.guestBlock}>
              <p style={styles.guestTitle}>Guest {i + 1}</p>
              <div style={styles.guestRow}>
                <div style={styles.guestField}>
                  <label style={styles.label}>Name</label>
                  <input
                    type="text"
                    value={g.name}
                    onChange={(e) => handleGuestChange(i, "name", e.target.value)}
                    placeholder="Full name"
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.guestField, flex: "0 0 80px" }}>
                  <label style={styles.label}>Age</label>
                  <input
                    type="number"
                    value={g.age}
                    onChange={(e) => handleGuestChange(i, "age", e.target.value)}
                    min={1} max={120}
                    placeholder="Age"
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.guestField, flex: "0 0 110px" }}>
                  <label style={styles.label}>Gender</label>
                  <select
                    value={g.gender}
                    onChange={(e) => handleGuestChange(i, "gender", e.target.value)}
                    style={styles.input}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            style={{ ...styles.btn, marginTop: "1rem", ...(submitting ? styles.btnDisabled : {}) }}
            disabled={submitting}
          >
            {submitting ? "Booking…" : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card:             { maxWidth: 820, margin: "60px auto", padding: "2rem", borderRadius: 10, boxShadow: "0 2px 16px rgba(0,0,0,0.1)", fontFamily: "system-ui, sans-serif" },
  stepLabel:        { margin: "0 0 0.2rem", fontSize: "0.78rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" },
  backBtn:          { background: "none", border: "none", color: "#0070f3", cursor: "pointer", fontSize: "0.9rem", padding: 0, marginBottom: "0.5rem" },
  heading:          { marginTop: 0, fontSize: "1.5rem" },
  summary:          { backgroundColor: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 5, padding: "0.5rem 0.75rem", marginBottom: "1rem", fontSize: "0.9rem" },
  summaryLabel:     { fontWeight: 600 },
  errorBanner:      { backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", padding: "0.75rem 1rem", borderRadius: 5, marginBottom: "1rem" },
  successBanner:    { backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb", padding: "1rem", borderRadius: 5 },
  confirmList:      { margin: "0.5rem 0 0", paddingLeft: "1.25rem" },
  section:          { marginTop: "0.5rem" },
  sectionHeading:   { fontSize: "1.15rem", marginBottom: "0.5rem" },
  hint:             { color: "#777", fontSize: "0.88rem", margin: "0 0 0.75rem" },
  timesBar:           { display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "#f0f7ff", border: "1px solid #b3d4ff", borderRadius: 6, padding: "0.5rem 0.85rem", fontSize: "0.88rem", color: "#333", marginBottom: "0.75rem" },
  timesDivider:       { color: "#b3d4ff" },
  datePickerWrap:     { display: "flex", justifyContent: "flex-start", marginBottom: "0.75rem" },
  dateConfirm:        { fontSize: "0.95rem", margin: "0 0 1rem", color: "#333" },
  twentyFourLayout:   { display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-start" },
  colLabel:           { fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "#555", margin: "0 0 0.6rem" },
  timeColumn:         { display: "flex", flexDirection: "column" as const, minWidth: 140 },
  timeListWrap:       { display: "flex", flexDirection: "column" as const, gap: "0.3rem", maxHeight: 320, overflowY: "auto" as const, border: "1px solid #e0e0e0", borderRadius: 6, padding: "0.4rem" },
  timeSlot:           { padding: "0.45rem 0.9rem", fontSize: "0.9rem", borderRadius: 5, border: "1px solid #e0e0e0", backgroundColor: "#fff", cursor: "pointer", textAlign: "left" as const, whiteSpace: "nowrap" as const, color: "#333" },
  timeSlotActive:     { backgroundColor: "#0070f3", color: "#fff", border: "1px solid #0070f3", fontWeight: 600 },
  summaryColumn:      { display: "flex", flexDirection: "column" as const, minWidth: 180 },
  twentyFourSummary:  { border: "1px solid #e0e0e0", borderRadius: 8, padding: "1rem 1.1rem", backgroundColor: "#fafafa" },
  summaryRow:         { display: "flex", gap: "0.65rem", alignItems: "flex-start" },
  summaryIcon:        { fontSize: "1.2rem", marginTop: "0.1rem" },
  summaryRowLabel:    { fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, color: "#888", letterSpacing: "0.04em", marginBottom: "0.2rem" },
  summaryRowValue:    { fontSize: "0.95rem", fontWeight: 600, color: "#222" },
  summaryDivider:     { height: 1, backgroundColor: "#ebebeb", margin: "0.75rem 0" },
  twentyFourNote:     { margin: "0.75rem 0 0", fontSize: "0.78rem", color: "#0070f3", fontWeight: 600, textAlign: "center" as const },
  label:              { fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.25rem", display: "block" },
  filterBar:        { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", padding: "0.6rem 0.75rem", backgroundColor: "#f9f9f9", borderRadius: 6, border: "1px solid #eee" },
  filterLabel:      { fontSize: "0.82rem", fontWeight: 600, color: "#555", marginRight: "0.25rem" },
  filterChip:       { padding: "0.25rem 0.65rem", fontSize: "0.82rem", borderRadius: 20, border: "1px solid #ccc", backgroundColor: "#fff", cursor: "pointer", color: "#444" },
  filterChipActive: { backgroundColor: "#0070f3", color: "#fff", border: "1px solid #0070f3" },
  clearBtn:         { marginLeft: "auto", padding: "0.25rem 0.65rem", fontSize: "0.8rem", background: "none", border: "none", color: "#0070f3", cursor: "pointer", textDecoration: "underline" },
  btn:              { padding: "0.6rem 1.4rem", fontSize: "1rem", cursor: "pointer", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: 5 },
  btnDisabled:      { backgroundColor: "#a0c4ff", cursor: "not-allowed" },
  textBtn:          { background: "none", border: "none", color: "#0070f3", cursor: "pointer", fontSize: "0.85rem", padding: 0 },
  cardGrid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem", marginTop: "0.5rem" },
  selectedRoomSummary: { backgroundColor: "#f0f7ff", border: "1px solid #b3d4ff", borderRadius: 6, padding: "0.6rem 0.9rem", fontSize: "0.92rem", marginBottom: "1.1rem" },
  input:            { padding: "0.5rem 0.65rem", fontSize: "0.95rem", borderRadius: 4, border: "1px solid #ccc", width: "100%", boxSizing: "border-box" },
  guestBlock:       { border: "1px solid #e8e8e8", borderRadius: 7, padding: "0.85rem 1rem", marginBottom: "0.75rem", backgroundColor: "#fafafa" },
  guestTitle:       { margin: "0 0 0.6rem", fontWeight: 600, fontSize: "0.92rem", color: "#444" },
  guestRow:         { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  guestField:       { display: "flex", flexDirection: "column", flex: "1 1 140px" },
};

export default RoomBookingForm;
