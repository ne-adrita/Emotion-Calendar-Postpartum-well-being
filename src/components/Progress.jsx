import React from "react";

export default function Progress() {
  return (
    <section className="module" data-module="progress">
      <div className="module-header">
        <h2 style={{ margin: 0 }}>Progress Tracking</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Monitor your well-being journey</div>
      </div>

      <div className="card">
        <h3>Weekly Summary</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">14</div>
            <div className="stat-label">Entries This Week</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">5.2</div>
            <div className="stat-label">Avg. Mood Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">78%</div>
            <div className="stat-label">Positive Days</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">3</div>
            <div className="stat-label">Meditation Sessions</div>
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="grid cols-2">
        <div className="card">
          <h3>Consistency Streak</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 700 }}>7</div>
            <div>
              <div style={{ fontWeight: 600 }}>Days in a row</div>
              <div className="small">You've logged your mood for 7 consecutive days</div>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 16 }}>
            <div className="progress-fill" style={{ width: "70%" }} />
          </div>
          <div className="small" style={{ textAlign: "center", marginTop: 8 }}>70% of your monthly goal</div>
        </div>

        <div className="card">
          <h3>Mood Improvement</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "var(--success)" }}>+12%</div>
            <div>
              <div style={{ fontWeight: 600 }}>Better than last month</div>
              <div className="small">Your average mood has improved</div>
            </div>
          </div>
          <div className="chart-placeholder" style={{ height: 100, marginTop: 12 }}>
            <div style={{ display: "flex", height: "100%", alignItems: "end", gap: 4 }}>
              <div style={{ flex: 1, background: "var(--muted)", height: "30%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--muted)", height: "40%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--muted)", height: "35%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--accent)", height: "50%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--accent)", height: "55%", borderRadius: 2 }}></div>
              <div style={{ flex: 1, background: "var(--accent)", height: "60%", borderRadius: 2 }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
