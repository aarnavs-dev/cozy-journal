import { useState, useEffect } from "react";
import EntriesPage from "./EntriesPage";

function App() {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showEntries, setShowEntries] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [title, setTitle] = useState("");
  const [isViewButtonHovering, setIsViewButtonHovering] = useState(false);

  // Load saved entries on first render
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("journalEntries")) || [];
    setEntries(saved);
  }, []);

  const saveEntry = () => {
    if (!entry.trim()) return;

    const timestamp = customDate 
      ? new Date(customDate).toLocaleString()
      : new Date().toLocaleString();

    const newEntry = {
      title: title.trim() || "",
      text: entry,
      timestamp: timestamp,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("journalEntries", JSON.stringify(updated));

    setEntry("");
    setCustomDate("");
    setTitle("");
  };

  // Show entries page if toggled
  if (showEntries) {
    return <EntriesPage onBack={() => setShowEntries(false)} />;
  }

  return (
    <div style={styles.page}>

      {/* ---- PAGE HEADER ---- */}
      <header style={styles.header}>
        <h2 style={styles.appTitle}>Unsent Journal</h2>
        <button 
          style={{
            ...styles.viewEntriesButton,
            ...(isViewButtonHovering ? styles.viewEntriesButtonHover : {})
          }}
          onClick={() => setShowEntries(true)}
          onMouseEnter={() => setIsViewButtonHovering(true)}
          onMouseLeave={() => setIsViewButtonHovering(false)}
        >
          View your entries →
        </button>
      </header>

      {/* ---- JOURNAL CARD ---- */}
      <div style={styles.card}>
        <div style={styles.headingWrapper}>
          <h1 style={styles.heading}>Write it here. Don't send.</h1>
          <div style={styles.headingAccent}></div>
        </div>
        <p style={styles.subtext}>This space is just for you.</p>

        <div style={styles.inputWrapper}>
          <label style={styles.inputLabel}>Title (optional)</label>
          <input
            type="text"
            style={styles.titleInput}
            placeholder="Give this entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={styles.dateInputWrapper}>
          <label style={styles.dateLabel}>Date (optional)</label>
          <input
            type="datetime-local"
            style={styles.dateInput}
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
          />
        </div>

        <textarea
          style={{
            ...styles.textarea,
            ...(isFocused ? styles.textareaFocused : {})
          }}
          placeholder="Type what you wish you could say…"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <button 
          style={{
            ...styles.button,
            ...(isHovering ? styles.buttonHover : {})
          }}
          onClick={saveEntry}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          Save entry
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f1ea",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "clamp(20px, 5vw, 40px) 20px",
  },

  header: {
    marginBottom: "clamp(20px, 3vw, 32px)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },

  appTitle: {
    color: "#6b5d52",
    fontSize: "clamp(25px, 4vw, 50px)",
    letterSpacing: "2px",
    textTransform: "uppercase",
    fontWeight: "600",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    fontFamily: "'Cormorant Garamond', serif",
  },

  viewEntriesButton: {
    background: "transparent",
    border: "1px solid rgba(107, 93, 82, 0.25)",
    color: "#6b5d52",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "8px 20px",
    borderRadius: "999px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "'Inter', sans-serif",
  },

  viewEntriesButtonHover: {
    background: "rgba(107, 93, 82, 0.08)",
    borderColor: "rgba(107, 93, 82, 0.5)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(107, 93, 82, 0.15)",
  },

  card: {
    width: "100%",
    maxWidth: "680px",
    padding: "clamp(32px, 6vw, 56px)",
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: "clamp(20px, 4vw, 32px)",
    boxShadow: "0 20px 60px rgba(107, 93, 82, 0.12), 0 8px 16px rgba(107, 93, 82, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    animation: "fadeInScale 0.6s ease-out",
    border: "1px solid rgba(235, 225, 210, 0.6)",
  },

  headingWrapper: {
    marginBottom: "8px",
  },

  heading: {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "400",
    color: "#4a3f35",
    marginBottom: "10px",
    letterSpacing: "0.3px",
    lineHeight: "1.3",
  },

  headingAccent: {
    width: "clamp(50px, 10vw, 70px)",
    height: "3px",
    background: "#c9a882",
    borderRadius: "3px",
    opacity: "0.6",
  },

  subtext: {
    fontFamily: "'Inter', sans-serif",
    color: "#64748b",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    marginBottom: "clamp(24px, 4vw, 36px)",
    fontWeight: "400",
  },

  inputWrapper: {
    marginBottom: "16px",
  },

  inputLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    color: "#6b5d52",
    fontWeight: "500",
    display: "block",
    marginBottom: "6px",
  },

  titleInput: {
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1.5px solid #ebe1d2",
    backgroundColor: "#fefdfb",
    color: "#3d3126",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.3s ease",
  },

  dateInputWrapper: {
    marginBottom: "16px",
  },

  dateLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    color: "#6b5d52",
    fontWeight: "500",
    display: "block",
    marginBottom: "6px",
  },

  dateInput: {
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1.5px solid #ebe1d2",
    backgroundColor: "#fefdfb",
    color: "#3d3126",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s ease",
  },

  textarea: {
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    minHeight: "clamp(180px, 30vh, 260px)",
    padding: "clamp(14px, 3vw, 20px)",
    borderRadius: "16px",
    border: "2px solid #ebe1d2",
    backgroundColor: "#fefdfb",
    color: "#3d3126",
    resize: "none",
    outline: "none",
    marginBottom: "clamp(20px, 3vw, 28px)",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    lineHeight: "1.65",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(107, 93, 82, 0.06)",
  },

  textareaFocused: {
    border: "2px solid #c9a882",
    boxShadow: "0 0 0 4px rgba(201, 168, 130, 0.2), 0 4px 16px rgba(201, 168, 130, 0.25)",
    backgroundColor: "#ffffff",
  },

  button: {
    fontFamily: "'Inter', sans-serif",
    padding: "clamp(12px, 2vw, 16px) clamp(28px, 5vw, 40px)",
    borderRadius: "999px",
    border: "none",
    background: "#ff6b9d",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    fontWeight: "600",
    letterSpacing: "0.3px",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 16px rgba(255, 107, 157, 0.35), 0 2px 8px rgba(255, 107, 157, 0.2)",
  },

  buttonHover: {
    transform: "scale(1.03) translateY(-2px)",
    boxShadow: "0 8px 24px rgba(255, 107, 157, 0.45), 0 4px 12px rgba(255, 107, 157, 0.3)",
    background: "#ff5a8d",
  },

};

export default App;
