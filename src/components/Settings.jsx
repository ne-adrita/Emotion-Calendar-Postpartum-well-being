import React from "react";

export default function Settings() {
  return (
    <section className="module" data-module="settings">
      <div className="module-header">
        <h2 style={{ margin: 0 }}>Settings</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Customize your experience</div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Account & Privacy</h3>
          <label>Name</label>
          <input type="text" defaultValue="Noshin Adrita" id="settingName" />
          <label style={{ marginTop: 8 }}>Email</label>
          <input type="text" defaultValue="noshin@example.com" />
          <label style={{ marginTop: 8 }}>Data sharing</label>
          <select id="sharing">
            <option>Private (default)</option>
            <option>Share anonymized data</option>
          </select>
          <div style={{ marginTop: 12 }}><button className="btn btn-primary">Save settings</button></div>
        </div>

        <div className="card">
          <h3>Notifications</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>Daily reminders</div>
            <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ marginRight: 8 }} />
              <span className="slider" />
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>Weekly insights</div>
            <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ marginRight: 8 }} />
              <span className="slider" />
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>Community updates</div>
            <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" style={{ marginRight: 8 }} />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
