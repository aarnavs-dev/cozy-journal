import { useState, useEffect } from "react";

function EntriesPage({ onBack }) {
  const [groupedEntries, setGroupedEntries] = useState({
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [allEntries, setAllEntries] = useState([]);

  const loadEntries = () => {
    const saved = JSON.parse(localStorage.getItem("journalEntries")) || [];
    setAllEntries(saved);
    const grouped = groupEntriesByDate(saved);
    setGroupedEntries(grouped);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const groupEntriesByDate = (entries) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    entries.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);
      const entryDay = new Date(
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate()
      );

      if (entryDay.getTime() === today.getTime()) {
        groups.today.push(entry);
      } else if (entryDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(entry);
      } else if (entryDay >= weekAgo) {
        groups.thisWeek.push(entry);
      } else {
        groups.older.push(entry);
      }
    });

    return groups;
  };

  const generateTitle = (text) => {
    const firstLine = text.split("\n")[0];
    const words = firstLine.trim().split(/\s+/).slice(0, 6).join(" ");
    return words || "Untitled";
  };

  const getDisplayTitle = (entry) => {
    // Use the custom title if it exists, otherwise auto-generate from text
    if (entry.title && entry.title.trim()) {
      return entry.title;
    }
    return generateTitle(entry.text);
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Just now";
    }
  };

  // Pastel color palette for Post-it notes
  const postItColors = [
    { bg: "#fff5e6", accent: "#ffd699" }, // soft peach/cream
    { bg: "#e8f5e9", accent: "#a5d6a7" }, // soft mint green
    { bg: "#fff9c4", accent: "#fff176" }, // bright butter yellow
    { bg: "#f3e5f5", accent: "#ce93d8" }, // soft lavender
    { bg: "#e0f7fa", accent: "#80deea" }, // light cyan
    { bg: "#fce4ec", accent: "#f48fb1" }, // soft pink
  ];

  const getCardColor = (index) => {
    return postItColors[index % postItColors.length];
  };

  const getCardRotation = (index) => {
    const rotations = ['-1deg', '0.5deg', '-0.5deg', '1deg', '0deg', '-1.5deg'];
    return rotations[index % rotations.length];
  };

  const deleteEntry = (entryToDelete) => {
    const updated = allEntries.filter(
      (entry) => entry.timestamp !== entryToDelete.timestamp || entry.text !== entryToDelete.text
    );
    localStorage.setItem("journalEntries", JSON.stringify(updated));
    loadEntries();
  };

  const startEdit = (entry, index) => {
    setEditingIndex(index);
    setEditText(entry.text);
  };

  const saveEdit = (entryToEdit) => {
    const updated = allEntries.map((entry) =>
      entry.timestamp === entryToEdit.timestamp && entry.text === entryToEdit.text
        ? { ...entry, text: editText }
        : entry
    );
    localStorage.setItem("journalEntries", JSON.stringify(updated));
    setEditingIndex(null);
    setEditText("");
    loadEntries();
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };
  const EntryCard = ({ entry, index }) => {
    const isEditing = editingIndex === index;
    const cardColor = getCardColor(index);
    const rotation = getCardRotation(index);

    return (
      <div 
        className="entry-card" 
        style={{ 
          ...styles.card, 
          animationDelay: `${index * 0.05}s`,
          background: cardColor.bg,
          transform: `rotate(${rotation})`,
        }}
      >
        {/* Cute tape accent at top */}
        <div style={{ ...styles.tapeAccent, background: cardColor.accent }}></div>
        
        <div style={styles.cardDateLabel}>{formatDate(entry.timestamp)}</div>
        
        {!isEditing ? (
          <>
            <h3 style={styles.cardTitle}>{getDisplayTitle(entry)}</h3>
            <div style={styles.cardTextWrapper}>
              <p style={styles.cardText}>{entry.text}</p>
            </div>
            <div style={styles.cardActions}>
              <button style={styles.editButton} onClick={() => startEdit(entry, index)}>
                ✎ Edit
              </button>
              <button style={styles.deleteButton} onClick={() => deleteEntry(entry)}>
                ✕ Delete
              </button>
            </div>
          </>
        ) : (
          <>
            <textarea
              style={styles.editTextarea}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div style={styles.cardActions}>
              <button style={styles.saveButton} onClick={() => saveEdit(entry)}>
                ✓ Save
              </button>
              <button style={styles.cancelButton} onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const Section = ({ title, entries, startIndex }) => {
    if (entries.length === 0) return null;

    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <div style={styles.grid}>
          {entries.map((entry, index) => (
            <EntryCard
              key={index}
              entry={entry}
              index={startIndex + index}
            />
          ))}
        </div>
      </div>
    );
  };

  const totalEntries =
    groupedEntries.today.length +
    groupedEntries.yesterday.length +
    groupedEntries.thisWeek.length +
    groupedEntries.older.length;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button className="back-button" style={styles.backButton} onClick={onBack}>
          ← Back to writing
        </button>
        <h1 style={styles.pageTitle}>Your Entries</h1>
        <p style={styles.pageSubtext}>
          {totalEntries} {totalEntries === 1 ? "entry" : "entries"} saved
        </p>
      </header>

      <div style={styles.container}>
        <Section title="TODAY" entries={groupedEntries.today} startIndex={0} />
        <Section
          title="YESTERDAY"
          entries={groupedEntries.yesterday}
          startIndex={groupedEntries.today.length}
        />
        <Section
          title="EARLIER THIS WEEK"
          entries={groupedEntries.thisWeek}
          startIndex={groupedEntries.today.length + groupedEntries.yesterday.length}
        />
        <Section
          title="OLDER"
          entries={groupedEntries.older}
          startIndex={
            groupedEntries.today.length +
            groupedEntries.yesterday.length +
            groupedEntries.thisWeek.length
          }
        />

        {totalEntries === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No entries yet.</p>
            <p style={styles.emptySubtext}>
              Start writing to see your thoughts here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f1ea",
    padding: "clamp(20px, 5vw, 40px) 20px",
  },

  header: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
    textAlign: "center",
  },

  backButton: {
    background: "transparent",
    border: "none",
    color: "#6b5d52",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', sans-serif",
    marginBottom: "20px",
  },

  pageTitle: {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: "clamp(32px, 5vw, 48px)",
    color: "#4a3f35",
    marginBottom: "8px",
    fontWeight: "400",
    letterSpacing: "0.3px",
  },

  pageSubtext: {
    fontFamily: "'Inter', sans-serif",
    color: "#8a7968",
    fontSize: "15px",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  section: {
    marginBottom: "clamp(40px, 6vw, 60px)",
  },

  sectionTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#a89178",
    fontWeight: "600",
    marginBottom: "20px",
    paddingLeft: "4px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "clamp(20px, 3.5vw, 32px)",
    alignItems: "start",
  },

  tapeAccent: {
    position: "absolute",
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "20px",
    borderRadius: "0 0 4px 4px",
    opacity: "0.3",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },

  card: {
    padding: "28px 22px 20px",
    borderRadius: "8px 8px 12px 8px",
    boxShadow: "0 6px 18px rgba(107, 93, 82, 0.15), 0 2px 6px rgba(107, 93, 82, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    animation: "fadeSlideUp 0.5s ease-out backwards",
    position: "relative",
    overflow: "hidden",
    minHeight: "200px",
    display: "flex",
    flexDirection: "column",
  },

  tapeAccent: {
    position: "absolute",
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "20px",
    borderRadius: "0 0 4px 4px",
    opacity: "0.3",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },

  cardDateLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "10px",
    color: "#6b5d52",
    marginBottom: "14px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    paddingTop: "6px",
  },

  cardTitle: {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: "19px",
    color: "#2c2416",
    marginBottom: "14px",
    fontWeight: "400",
    lineHeight: "1.5",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
  },

  cardTextWrapper: {
    flex: "1",
    marginBottom: "16px",
    maxHeight: "100px",
    overflow: "hidden",
  },

  cardText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    color: "#3d3126",
    lineHeight: "1.7",
    marginBottom: "0",
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
  },

  editButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    padding: "7px 14px",
    borderRadius: "12px",
    border: "1.5px solid rgba(107, 93, 82, 0.25)",
    background: "rgba(255, 255, 255, 0.6)",
    color: "#6b5d52",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },

  deleteButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    padding: "7px 14px",
    borderRadius: "12px",
    border: "1.5px solid rgba(200, 70, 70, 0.3)",
    background: "rgba(255, 255, 255, 0.6)",
    color: "#c84646",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },

  saveButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    padding: "6px 14px",
    borderRadius: "6px",
    border: "none",
    background: "#c9a882",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },

  cancelButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    padding: "6px 14px",
    borderRadius: "6px",
    border: "1px solid #a89178",
    background: "transparent",
    color: "#6b5d52",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },

  editTextarea: {
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    minHeight: "120px",
    padding: "12px",
    borderRadius: "8px",
    border: "1.5px solid #c9a882",
    backgroundColor: "#ffffff",
    color: "#3d3126",
    fontSize: "14px",
    lineHeight: "1.6",
    resize: "vertical",
    outline: "none",
    marginBottom: "12px",
  },

  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
  },

  emptyText: {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: "24px",
    color: "#6b5d52",
    marginBottom: "8px",
  },

  emptySubtext: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "15px",
    color: "#a89178",
  },
};

export default EntriesPage;
