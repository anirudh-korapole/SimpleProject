import React, { useState } from "react";
import EntryForm from "./components/EntryForm";
import RoomBookingForm from "./components/RoomBookingForm";
import { Entry } from "./types/api.types";

const App: React.FC = () => {
  // Once step 1 completes, submittedEntry holds the saved Entry.
  // This triggers the transition to step 2 (room booking).
  const [submittedEntry, setSubmittedEntry] = useState<Entry | null>(null);

  return submittedEntry
    ? <RoomBookingForm entry={submittedEntry} />
    : <EntryForm onSuccess={setSubmittedEntry} />;
};

export default App;
