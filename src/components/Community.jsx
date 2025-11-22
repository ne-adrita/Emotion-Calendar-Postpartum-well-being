import React from "react";

export default function Community() {
  return (
    <section className="module" data-module="community">
      <div className="module-header">
        <h2 style={{ margin: 0 }}>Community</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Connect with other parents</div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Support Groups</h3>
          <div className="resource-card">
            <div className="resource-icon">👥</div>
            <div>
              <div style={{ fontWeight: 600 }}>Local Meetups</div>
              <div className="small">Find parents in your area</div>
            </div>
          </div>
          <div className="resource-card">
            <div className="resource-icon">💬</div>
            <div>
              <div style={{ fontWeight: 600 }}>Online Forums</div>
              <div className="small">24/7 discussion boards</div>
            </div>
          </div>
          <div className="resource-card">
            <div className="resource-icon">📱</div>
            <div>
              <div style={{ fontWeight: 600 }}>Virtual Support Groups</div>
              <div className="small">Weekly video meetings</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Recent Community Activity</h3>
          <div className="activity-item">
            <div className="activity-time">2h ago</div>
            <div className="activity-content">
              <div style={{ fontWeight: 600 }}>Maria shared a tip:</div>
              <div className="small">"The 5 S's really helped soothe my baby during fussy evenings!"</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-time">5h ago</div>
            <div className="activity-content">
              <div style={{ fontWeight: 600 }}>David asked:</div>
              <div className="small">"Any recommendations for postpartum anxiety resources?"</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-time">1d ago</div>
            <div className="activity-content">
              <div style={{ fontWeight: 600 }}>Sarah posted:</div>
              <div className="small">"Finally getting 4-hour sleep stretches - there is light at the end of the tunnel!"</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
