import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [selectedMood, setSelectedMood] = useState("happy");
  const [quickNote, setQuickNote] = useState("");

  useEffect(() => {
    const arr = JSON.parse(localStorage.getItem("pc_demo_entries_v1") || "[]");
    setEntries(arr.sort((a,b) => new Date(b.date) - new Date(a.date)));
  }, []);

  const handleSaveQuick = () => {
    if (!quickNote.trim()) return;
    
    const arr = JSON.parse(localStorage.getItem("pc_demo_entries_v1") || "[]");
    const newEntry = {
      id: Date.now(),
      mood: selectedMood,
      title: quickNote.slice(0,36),
      note: quickNote,
      date: new Date().toISOString()
    };
    
    arr.push(newEntry);
    localStorage.setItem("pc_demo_entries_v1", JSON.stringify(arr));
    setEntries(arr.sort((a,b) => new Date(b.date) - new Date(a.date)));
    setQuickNote("");
    alert('Entry saved (local demo)');
  };

  const handleClearQuick = () => {
    setQuickNote("");
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      'happy': '😊',
      'sad': '😔',
      'anxious': '😰',
      'tired': '😴',
      'angry': '😠',
      'calm': '😌'
    };
    return emojis[mood] || '😐';
  };

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <section className="module" data-module="dashboard">
      <div className="module-header">
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Today: <span id="todayDate">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
      
      <div className="grid cols-3" style={{ alignItems: "stretch" }}>
        <div className="card">
          <h3 style={{ margin: "0 0 8px 0" }}>Today's mood</h3>
          <div className="mood-emoji">🙂</div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <div className="mood-pill" style={{ background: "rgba(139,211,199,0.12)", color: "var(--accent)" }}>
              Happy
            </div>
            <div className="small" style={{ color: "var(--muted)" }}>Last entry 2h ago</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: "0 0 8px 0" }}>Weekly quick glance</h3>
          <div className="chart-placeholder">
            <div style={{ display: "flex", height: "100%", alignItems: "end", gap: 4 }}>
              <div style={{ flex: 1, background: "var(--accent)", height: "30%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--accent)", height: "60%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--accent)", height: "40%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--accent)", height: "80%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--accent)", height: "50%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--accent)", height: "70%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--accent)", height: "90%", borderRadius: 2 }}></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: "0 0 8px 0" }}>Red flag status</h3>
          <div className="notification success">
            <div className="notification-icon">✓</div>
            <div>
              <div style={{ fontWeight: 600 }}>No prolonged sadness detected</div>
              <div className="small">Your mood patterns appear stable</div>
            </div>
          </div>
          <div className="btn btn-ghost" style={{ marginTop: 8 }}>View help resources</div>
        </div>
      </div>

      <div style={{ height: 18 }}></div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Recent entries</h3>
          <div id="entriesList">
            {entries.slice(0, 5).map(entry => (
              <div key={entry.id} className="entry">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600 }}>{entry.title}</div>
                  <div className="meta">{formatDateTime(entry.date)}</div>
                </div>
                <div style={{ marginTop: 6, color: "var(--muted)" }}>{entry.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Quick add</h3>
          <div style={{ marginTop: 8 }}>
            <label>How are you feeling?</label>
            <div className="mood-selector">
              <div 
                className={`mood-option ${selectedMood === "happy" ? "selected" : ""}`} 
                data-mood="happy" 
                onClick={() => setSelectedMood("happy")}
              >
                😊 Happy
              </div>
              <div 
                className={`mood-option ${selectedMood === "sad" ? "selected" : ""}`} 
                data-mood="sad" 
                onClick={() => setSelectedMood("sad")}
              >
                😔 Sad
              </div>
              <div 
                className={`mood-option ${selectedMood === "anxious" ? "selected" : ""}`} 
                data-mood="anxious" 
                onClick={() => setSelectedMood("anxious")}
              >
                😰 Anxious
              </div>
              <div 
                className={`mood-option ${selectedMood === "tired" ? "selected" : ""}`} 
                data-mood="tired" 
                onClick={() => setSelectedMood("tired")}
              >
                😴 Tired
              </div>
            </div>
            <label style={{ marginTop: 8 }}>Note</label>
            <input 
              type="text" 
              id="quickNote" 
              placeholder="One-line note..." 
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
            />
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button className="btn btn-primary" onClick={handleSaveQuick}>
                Save
              </button>
              <button className="btn btn-ghost" onClick={handleClearQuick}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}