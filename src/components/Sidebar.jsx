import React from "react";

export default function Sidebar({ active, onNavigate }) {
  const items = [
    { key: "dashboard", label: "🏠 Dashboard" },
    { key: "journal", label: "📝 Journal" },
    { key: "calendar", label: "📅 Calendar" },
    { key: "insights", label: "📈 Insights" },
    { key: "resources", label: "🧭 Resources" },
    { key: "community", label: "👥 Community" },
    { key: "meditation", label: "🧘‍♀️ Meditation" },
    { key: "progress", label: "📊 Progress" },
    { key: "ai-chat", label: "🤖 AI Chat" },
    { key: "settings", label: "⚙️ Settings" },
  ];

  return (
    <aside className="sidebar" role="navigation">
      <div className="brand">
        <div className="logo">EC</div>
        <div>
          <div style={{ fontWeight: 700 }}>Emotion Calendar</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Postpartum well-being</div>
        </div>
      </div>

      <nav className="nav" aria-label="Main navigation" style={{ marginTop: 16 }}>
        {items.map((it) => (
          <button
            key={it.key}
            className={`nav-btn ${active === it.key ? "active" : ""}`}
            data-module={it.key}
            onClick={() => onNavigate(it.key)}
          >
            {it.label}
          </button>
        ))}

        <hr style={{ margin: "14px 0", border: "none", borderTop: "1px solid rgba(255,255,255,0.03)" }} />
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Logged in as</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div>
            <div style={{ fontWeight: 600 }}>Noshin Adrita</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>UserID: AFE-2211</div>
          </div>
          <div className="avatar">NA</div>
        </div>
      </nav>
    </aside>
  );
}
