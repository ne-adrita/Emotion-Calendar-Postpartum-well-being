import React, { useEffect, useState } from "react";
import { getMoodEmoji } from "../utils/helpers";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const arr = JSON.parse(localStorage.getItem("pc_demo_entries_v1") || "[]");
    setEntries(arr);
  }, []);

  const monthNames = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function buildCalendar() {
    const first = new Date(currentYear, currentMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < startDay; i++) {
      cells.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEntries = entries.filter(entry => entry.date && entry.date.startsWith(dateStr));
      cells.push({
        day,
        date: dateStr,
        entries: dayEntries,
        isToday: isToday(currentYear, currentMonth, day)
      });
    }
    
    return cells;
  }

  function isToday(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  }

  function prevMonth() {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(currentYear - 1);
        return 11;
      }
      return prev - 1;
    });
  }

  function nextMonth() {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(currentYear + 1);
        return 0;
      }
      return prev + 1;
    });
  }

  function handleDayClick(dayData) {
    if (dayData.entries.length > 0) {
      const entriesText = dayData.entries.map(entry => 
        `${getMoodEmoji(entry.mood)} ${entry.mood}\n${entry.title || ''}\n${entry.note || ''}`
      ).join('\n---\n');
      alert(`Entries for ${new Date(dayData.date).toLocaleDateString()}:\n\n${entriesText}`);
    }
  }

  const calendarCells = buildCalendar();

  return (
    <section className="module" data-module="calendar">
      <div className="module-header">
        <h2>Emotion Calendar</h2>
        <div className="module-subtitle">Your monthly mood tracker</div>
      </div>

      <div className="card">
        {/* Calendar Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <button className="btn btn-ghost" onClick={prevMonth}>←</button>
          <h3 style={{ margin: 0 }}>{monthNames[currentMonth]} {currentYear}</h3>
          <button className="btn btn-ghost" onClick={nextMonth}>→</button>
        </div>

        {/* Day Headers */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(7, 1fr)", 
          gap: "4px", 
          marginBottom: "12px",
          textAlign: "center"
        }}>
          {dayNames.map(day => (
            <div key={day} style={{ 
              fontSize: "12px", 
              color: "var(--muted)", 
              fontWeight: "600",
              padding: "8px 0"
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(7, 1fr)", 
          gap: "4px"
        }}>
          {calendarCells.map((cell, index) => (
            <div 
              key={index}
              style={{
                aspectRatio: "1",
                padding: "8px",
                borderRadius: "8px",
                background: cell ? (cell.isToday ? "var(--accent)" : "var(--glass)") : "transparent",
                border: cell?.isToday ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.05)",
                cursor: cell ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative"
              }}
              onClick={() => cell && handleDayClick(cell)}
            >
              {cell && (
                <>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: cell.isToday ? "600" : "400",
                    color: cell.isToday ? "#04202d" : "var(--text)",
                    marginBottom: "4px"
                  }}>
                    {cell.day}
                  </div>
                  {cell.entries.length > 0 && (
                    <div style={{ 
                      fontSize: "12px",
                      display: "flex",
                      gap: "2px"
                    }}>
                      {cell.entries.slice(0, 2).map((entry, idx) => (
                        <span key={idx} title={`${getMoodEmoji(entry.mood)} ${entry.mood}`}>
                          {getMoodEmoji(entry.mood)}
                        </span>
                      ))}
                      {cell.entries.length > 2 && (
                        <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                          +{cell.entries.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ 
          marginTop: "20px", 
          paddingTop: "16px", 
          borderTop: "1px solid rgba(255,255,255,0.1)",
          fontSize: "12px"
        }}>
          <div style={{ color: "var(--muted)", marginBottom: "8px" }}>Mood Legend:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {['happy', 'sad', 'anxious', 'tired', 'angry', 'calm'].map(mood => (
              <div key={mood} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{getMoodEmoji(mood)}</span>
                <span style={{ color: "var(--muted)" }}>{mood}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}