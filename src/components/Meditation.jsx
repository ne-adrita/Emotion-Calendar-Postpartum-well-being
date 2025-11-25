// src/components/MeditationPanelAdvancedWithTF.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * MeditationPanelAdvancedWithTF.jsx
 * - Full advanced meditation panel (MP3 upload, breathing, sleep tracker)
 * - Right column shows per-day sleep records + advice based on sleep time
 */

export default function MeditationPanelAdvancedWithTF() {
  // THEME
  const THEME = {
    bg: "#0F172A",
    accent: "#8BD3C7",
    highlight: "#FFD6E0",
    text: "#FFFFFF"
  };

  // AUDIO
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => Number(localStorage.getItem("med_volume")) || 0.7);
  const [savedAudioBase64, setSavedAudioBase64] = useState(() => localStorage.getItem("med_music_base64") || null);
  const [audioName, setAudioName] = useState(() => localStorage.getItem("med_music_name") || null);

  // BREATHING
  const phases = [
    { text: "Breathe in…", duration: 4000, scale: 1.45 },
    { text: "Hold…", duration: 2000, scale: 1.45 },
    { text: "Breathe out…", duration: 5000, scale: 1.0 },
    { text: "Hold…", duration: 2000, scale: 1.0 }
  ];
  const [phaseText, setPhaseText] = useState(phases[0].text);
  const [circleScale, setCircleScale] = useState(1);
  const phaseTimerRef = useRef(null);
  const phaseIndexRef = useRef(0);

  // AFFIRMATIONS / TIPS
  const AFFIRMATIONS = [
    "Take a slow breath. You are doing so well.",
    "This moment is yours — gentle and safe.",
    "One small breath at a time; you're not alone.",
    "Your care matters. Your rest matters.",
    "Breathe in patience, breathe out pressure."
  ];
  const TIPS = [
    "Try a 5-minute nap when your baby naps — short rest helps reset.",
    "Hydration supports mood. Keep water nearby during feedings.",
    "Light movement (gentle walk or stretch) can reduce stress.",
    "Share a small gratitude list with a friend or partner tonight.",
    "Prioritize one small restful routine before bed (dim lights, warm drink)."
  ];
  const [affirmation, setAffirmation] = useState(AFFIRMATIONS[0]);
  const [tip, setTip] = useState(TIPS[0]);

  // SLEEP TRACKER
  const [sleepEntries, setSleepEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("med_sleep_entries") || "[]"); } catch { return []; }
  });

  // ---------- Effects: rotate affirmation & tip ----------
  useEffect(() => {
    const a = setInterval(() => setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]), 15000);
    const t = setInterval(() => setTip(TIPS[Math.floor(Math.random() * TIPS.length)]), 25000);
    return () => { clearInterval(a); clearInterval(t); };
  }, []);

  // ---------- init audio element ----------
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = document.createElement("audio");
      audioRef.current.loop = true;
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.volume = volume;
      if (savedAudioBase64) audioRef.current.src = savedAudioBase64;
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("med_volume", String(volume));
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // ---------- helpers ----------
  const fileToBase64 = (file) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => res(e.target.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

  // ---------- upload mp3 ----------
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/") && !file.name.endsWith(".mp3")) {
      alert("Please upload a valid audio file (mp3).");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      localStorage.setItem("med_music_base64", base64);
      localStorage.setItem("med_music_name", file.name);
      setSavedAudioBase64(base64);
      setAudioName(file.name);
      if (audioRef.current) audioRef.current.src = base64;
      alert("Music uploaded and saved. Click Start to play (user gesture required).");
    } catch (err) {
      console.error(err);
      alert("Failed to read file. Try again.");
    }
  };

  // ---------- breathing ----------
  const startBreathing = () => {
    phaseIndexRef.current = 0;
    const run = () => {
      const p = phases[phaseIndexRef.current];
      setPhaseText(p.text);
      setCircleScale(p.scale);
      phaseTimerRef.current = setTimeout(() => {
        phaseIndexRef.current = (phaseIndexRef.current + 1) % phases.length;
        run();
      }, p.duration);
    };
    run();
  };
  const stopBreathing = () => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    setPhaseText("Take a deep breath…");
    setCircleScale(1);
  };

  // ---------- START / STOP SESSION ----------
  const startSession = async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = document.createElement("audio");
        audioRef.current.loop = true;
        audioRef.current.crossOrigin = "anonymous";
        if (savedAudioBase64) audioRef.current.src = savedAudioBase64;
      }
      if (!audioRef.current.src) {
        alert("No audio found. Upload an MP3 or choose a default.");
        return;
      }
      audioRef.current.volume = volume;
      await audioRef.current.play();
      setIsPlaying(true);
      startBreathing();
    } catch (err) {
      console.error("startSession:", err);
      alert("Playback blocked — interact then try Start again.");
    }
  };

  const stopSession = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
    stopBreathing();
  };

  // ---------- SLEEP TRACKER FUNCTIONS ----------
  const addSleepEntry = (entry) => {
    const updated = [entry, ...sleepEntries].slice(0, 365);
    setSleepEntries(updated);
    localStorage.setItem("med_sleep_entries", JSON.stringify(updated));
  };

  const handleAddSleep = (e) => {
    e.preventDefault();
    const date = e.target.date.value || new Date().toISOString().slice(0, 10);
    const hours = Number(e.target.hours.value) || 0;
    const quality = e.target.quality.value || "Unknown";
    
    // Validate hours
    if (hours < 0 || hours > 24) {
      alert('Please enter a valid number of hours (0-24)');
      return;
    }

    addSleepEntry({ id: Date.now(), date, hours, quality });
    e.target.reset();
    e.target.querySelector('input[name="date"]').value = new Date().toISOString().slice(0,10);
  };

  const exportSleepCSV = () => {
    if (!sleepEntries.length) { 
      alert("No sleep entries to export."); 
      return; 
    }
    const header = "date,hours,quality\n";
    const rows = sleepEntries.map(s => `${s.date},${s.hours},${s.quality}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); 
    a.href = url; 
    a.download = `sleep-data-${new Date().toISOString().slice(0,10)}.csv`; 
    a.click(); 
    URL.revokeObjectURL(url);
  };

  const deleteSleepEntry = (id) => {
    const updatedEntries = sleepEntries.filter(entry => entry.id !== id);
    setSleepEntries(updatedEntries);
    localStorage.setItem("med_sleep_entries", JSON.stringify(updatedEntries));
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Excellent': return '#10b981';
      case 'Good': return '#3b82f6';
      case 'Fair': return '#f59e0b';
      case 'Poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSleepRecommendation = () => {
    if (sleepEntries.length === 0) {
      return "Start tracking your sleep to get personalized recommendations for postpartum recovery!";
    }
    
    const avgHours = sleepEntries.reduce((a, b) => a + b.hours, 0) / sleepEntries.length;
    const goodSleepDays = sleepEntries.filter(s => s.quality === "Excellent" || s.quality === "Good").length;
    const sleepPercentage = (goodSleepDays / sleepEntries.length) * 100;
    
    let message = "";

    if (avgHours >= 7 && avgHours <= 9) {
      message = `Excellent! You're averaging ${avgHours.toFixed(1)} hours with ${sleepPercentage.toFixed(0)}% good quality sleep. Perfect for postpartum recovery!`;
    } else if (avgHours >= 5 && avgHours < 7) {
      message = `You're averaging ${avgHours.toFixed(1)} hours. Try to nap when baby naps - every hour helps with recovery and mood.`;
    } else if (avgHours < 5) {
      message = `At ${avgHours.toFixed(1)} hours average, prioritize rest. Ask for help with night feeds and take short daytime naps.`;
    } else if (avgHours > 9) {
      message = `You're getting ${avgHours.toFixed(1)} hours - great for recovery! Ensure you're also getting gentle movement during awake times.`;
    }

    // Add quality-based advice
    if (sleepPercentage < 50) {
      message += " Consider improving sleep environment: dark room, comfortable temperature, and white noise.";
    }

    return message;
  };

  const getTrendIcon = () => {
    if (sleepEntries.length < 2) return '➡️';
    
    const recentAvg = sleepEntries.slice(0, 3).reduce((a, b) => a + b.hours, 0) / Math.min(3, sleepEntries.length);
    const previousAvg = sleepEntries.slice(3, 6).reduce((a, b) => a + b.hours, 0) / Math.min(3, sleepEntries.length - 3);
    
    if (recentAvg > previousAvg + 0.5) return '📈';
    if (recentAvg < previousAvg - 0.5) return '📉';
    return '➡️';
  };

  // ---------- cleanup on unmount ----------
  useEffect(() => {
    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // ---------- UI ----------
  return (
    <div style={{ background: THEME.bg, color: THEME.text, minHeight: "100vh", padding: 18, fontFamily: "Inter, system-ui, -apple-system" }}>
      <style>{`
        .card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-radius:12px; padding:14px; box-shadow: 0 8px 24px rgba(2,6,23,0.6); }
        .btn { padding:8px 12px; border-radius:10px; font-weight:600; cursor:pointer; border:none; }
        @media (max-width:900px) { .layout { grid-template-columns: 1fr !important; } .rightCol { padding-top: 12px; } }
      `}</style>

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, color: THEME.accent }}>🌸 Calm for New Mothers</h1>
          <div style={{ color: "#9AA6B2", marginTop: 6 }}>Gentle meditations, sleep tools, and postpartum support</div>
        </div>
      </header>

      <div className="layout" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16 }}>
        {/* LEFT */}
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <h3 style={{ color: THEME.accent, marginTop: 0 }}>Add Music (MP3) — Auto-save</h3>
            <div style={{ color: "#9AA6B2", marginBottom: 8 }}>Upload .mp3 from your device. Saved locally for next visits.</div>
            <input type="file" accept=".mp3,audio/mp3" onChange={handleFileUpload} style={{ display: "block", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn" style={{ background: THEME.accent, color: THEME.bg }} onClick={startSession}>Start Session</button>
              <button className="btn" style={{ background: THEME.highlight, color: THEME.bg }} onClick={stopSession}>Stop</button>
              <div style={{ color: "#9AA6B2" }}>{audioName ? `Saved: ${audioName}` : (savedAudioBase64 ? "Custom music saved" : "No saved music")}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ color: "#9AA6B2" }}>Volume</label>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e)=>setVolume(Number(e.target.value))} style={{ display: "block", width: "100%" }} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 12, padding: '20px' }}>
            <h3 style={{ color: THEME.accent, marginTop: 0 }}>Breathing Exercise</h3>
            <div style={{ display: "flex", gap: 50, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{
                width: 100, height: 100, borderRadius: 999, display: "grid", placeItems: "center",
                transform: `scale(${circleScale})`, transition: "transform 700ms cubic-bezier(.2,.8,.2,1)",
                border: `3px solid ${THEME.highlight}`, background: isPlaying ? "rgba(139,211,199,0.08)" : "transparent", marginBottom: 8
              }}>
                <div style={{ fontSize: 36 }}>{isPlaying ? "🧘‍♀️" : "🕊️"}</div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{phaseText}</div>
                <div style={{ color: "#9AA6B2", marginTop: 6 }}>Try 5 full cycles when you feel overwhelmed.</div>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button className="btn" style={{ background: THEME.accent, color: THEME.bg }} onClick={() => { if (!isPlaying) startSession(); }}>Start</button>
                  <button className="btn" style={{ background: THEME.highlight, color: THEME.bg }} onClick={stopSession}>Stop</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 12 }}>
            <h3 style={{ color: THEME.accent, marginTop: 0 }}>Positive Affirmation</h3>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{affirmation}</div>
            <div style={{ color: "#9AA6B2", marginTop: 8 }}>Affirmations rotate every 15 seconds.</div>
          </div>

          <div className="card" style={{ marginBottom: 12 }}>
            <h3 style={{ color: THEME.accent, marginTop: 0 }}>Postpartum Mood Tip</h3>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{tip}</div>
            <div style={{ color: "#9AA6B2", marginTop: 8 }}>Tips rotate every 25 seconds.</div>
          </div>
        </div>

        {/* RIGHT - Enhanced Sleep Tracker & Summary */}
        <div className="rightCol">
          {/* Sleep Tracker Card */}
          <div className="card" style={{ marginBottom: 12 }}>
            <h3 style={{ color: THEME.accent, marginTop: 0 }}>Sleep Tracker</h3>
            <form onSubmit={handleAddSleep} style={{ display: "grid", gap: 12 }}>
              <label style={{ color: "#9AA6B2", display: "grid", gap: 4 }}>
                Date:
                <input 
                  name="date" 
                  type="date" 
                  defaultValue={new Date().toISOString().slice(0,10)}
                  style={{
                    padding: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.05)",
                    color: "white"
                  }}
                  required
                />
              </label>
              
              <label style={{ color: "#9AA6B2", display: "grid", gap: 4 }}>
                Hours:
                <input 
                  name="hours" 
                  type="number" 
                  step="0.25" 
                  min="0"
                  max="24"
                  placeholder="e.g. 6.5" 
                  style={{
                    padding: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.05)",
                    color: "white"
                  }}
                  required
                />
              </label>
              
              <label style={{ color: "#9AA6B2", display: "grid", gap: 4 }}>
                Quality:
                <select 
                  name="quality"
                  style={{
                    padding: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.05)",
                    color: "white"
                  }}
                >
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                  <option>Unknown</option>
                </select>
              </label>
              
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  className="btn" 
                  style={{ 
                    background: THEME.accent, 
                    color: THEME.bg,
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    flex: 1
                  }} 
                  type="submit"
                >
                  Save Entry
                </button>
                <button 
                  className="btn" 
                  style={{ 
                    background: THEME.highlight, 
                    color: THEME.bg,
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }} 
                  onClick={(e)=>{ e.preventDefault(); exportSleepCSV(); }}
                  disabled={sleepEntries.length === 0}
                >
                  Export CSV
                </button>
              </div>
            </form>
          </div>

          {/* Sleep Summary Card */}
          <div className="card" style={{ marginBottom: 12 }}>
            <h3 style={{ color: THEME.accent, marginTop: 0 }}>Sleep Summary</h3>
            
            {/* Sleep Statistics */}
            {sleepEntries.length > 0 && (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: 12, 
                marginBottom: 16,
                padding: "12px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "8px"
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: THEME.accent }}>
                    {sleepEntries.length}
                  </div>
                  <div style={{ fontSize: "12px", color: "#9AA6B2" }}>Total Entries</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: THEME.accent }}>
                    {sleepEntries.length > 0 ? (sleepEntries.reduce((a, b) => a + b.hours, 0) / sleepEntries.length).toFixed(1) : 0}h
                  </div>
                  <div style={{ fontSize: "12px", color: "#9AA6B2" }}>Avg. Hours</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: THEME.accent }}>
                    {sleepEntries.filter(s => s.quality === "Excellent" || s.quality === "Good").length}
                  </div>
                  <div style={{ fontSize: "12px", color: "#9AA6B2" }}>Good+ Days</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: THEME.accent }}>
                    {sleepEntries.length > 0 ? Math.max(...sleepEntries.map(s => s.hours)).toFixed(1) : 0}h
                  </div>
                  <div style={{ fontSize: "12px", color: "#9AA6B2" }}>Best Sleep</div>
                </div>
              </div>
            )}

            {/* Personalized Advice */}
            <div style={{ color: "#9AA6B2", marginBottom: 16, lineHeight: 1.5 }}>
              {sleepEntries.length > 0 ? (() => {
                const avgHours = sleepEntries.reduce((a, b) => a + b.hours, 0) / sleepEntries.length;
                const goodSleepDays = sleepEntries.filter(s => s.quality === "Excellent" || s.quality === "Good").length;
                const sleepPercentage = (goodSleepDays / sleepEntries.length) * 100;
                
                let message = "";
                let color = THEME.accent;

                if (avgHours >= 7 && avgHours <= 9) {
                  message = `Excellent! You're averaging ${avgHours.toFixed(1)} hours with ${sleepPercentage.toFixed(0)}% good quality sleep. Perfect for postpartum recovery!`;
                  color = "#42f584";
                } else if (avgHours >= 5 && avgHours < 7) {
                  message = `You're averaging ${avgHours.toFixed(1)} hours. Try to nap when baby naps - every hour helps with recovery and mood.`;
                  color = "#f5c142";
                } else if (avgHours < 5) {
                  message = `At ${avgHours.toFixed(1)} hours average, prioritize rest. Ask for help with night feeds and take short daytime naps.`;
                  color = "#f54242";
                } else if (avgHours > 9) {
                  message = `You're getting ${avgHours.toFixed(1)} hours - great for recovery! Ensure you're also getting gentle movement during awake times.`;
                  color = "#42d3f5";
                }

                // Add quality-based advice
                if (sleepPercentage < 50) {
                  message += " Consider improving sleep environment: dark room, comfortable temperature, and white noise.";
                }

                return <span style={{ color, fontWeight: "500" }}>{message}</span>;
              })() : "Add your sleep entries to get personalized advice and track your postpartum recovery."}
            </div>

            {/* Recent Sleep Entries */}
            <div style={{ color: "#9AA6B2", marginBottom: 8, fontWeight: "600", fontSize: "14px" }}>
              Recent Entries ({sleepEntries.length} total)
            </div>

            {sleepEntries.length === 0 ? (
              <div style={{ 
                color: "#9AA6B2", 
                textAlign: "center", 
                padding: "20px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "8px",
                fontSize: "14px"
              }}>
                No sleep entries yet — track your sleep to monitor postpartum recovery!
              </div>
            ) : (
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#9AA6B2", fontSize: 13 }}>
                      <th style={{ padding: "8px 4px" }}>Date</th>
                      <th style={{ padding: "8px 4px" }}>Hours</th>
                      <th style={{ padding: "8px 4px" }}>Quality</th>
                      <th style={{ padding: "8px 4px", width: "40px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sleepEntries.slice(0, 7).map(s => (
                      <tr key={s.id} style={{ borderBottom: "1px dashed rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "8px 4px", fontSize: "14px" }}>{s.date}</td>
                        <td style={{ padding: "8px 4px", fontSize: "14px" }}>{s.hours}h</td>
                        <td style={{ padding: "8px 4px" }}>
                          <span style={{ 
                            color: getQualityColor(s.quality),
                            fontSize: "14px",
                            fontWeight: "500"
                          }}>
                            {s.quality}
                          </span>
                        </td>
                        <td style={{ padding: "8px 4px", textAlign: "center" }}>
                          <button
                            onClick={() => deleteSleepEntry(s.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: "12px",
                              opacity: 0.7
                            }}
                            title="Delete entry"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {sleepEntries.length > 7 && (
                  <div style={{ 
                    textAlign: "center", 
                    color: "#9AA6B2", 
                    fontSize: "12px", 
                    marginTop: "8px",
                    padding: "8px"
                  }}>
                    Showing 7 of {sleepEntries.length} entries
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button 
                className="btn" 
                style={{ 
                  background: THEME.accent, 
                  color: THEME.bg,
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  flex: 1
                }} 
                onClick={exportSleepCSV}
                disabled={sleepEntries.length === 0}
              >
                Export CSV
              </button>
              <button 
                className="btn" 
                style={{ 
                  background: THEME.highlight, 
                  color: THEME.bg,
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }} 
                onClick={() => { 
                  if (confirm("Clear all sleep entries?")) { 
                    setSleepEntries([]); 
                    localStorage.removeItem("med_sleep_entries"); 
                  } 
                }}
                disabled={sleepEntries.length === 0}
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}