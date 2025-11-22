import React from "react";

export default function Resources() {
  return (
    <section className="module" data-module="resources">
      <div className="module-header">
        <h2 style={{ margin: 0 }}>Resources</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Helpful information and support</div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Mental Health Resources</h3>
          <div className="resource-card">
            <div className="resource-icon">📚</div>
            <div>
              <div style={{ fontWeight: 600 }}>Postpartum Depression Guide</div>
              <div className="small">Understanding symptoms and when to seek help</div>
            </div>
          </div>
          <div className="resource-card">
            <div className="resource-icon">🩺</div>
            <div>
              <div style={{ fontWeight: 600 }}>Find a Therapist</div>
              <div className="small">Local specialists in postpartum care</div>
            </div>
          </div>
          <div className="resource-card">
            <div className="resource-icon">📞</div>
            <div>
              <div style={{ fontWeight: 600 }}>Crisis Hotlines</div>
              <div className="small">24/7 support for immediate help</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Self-Care Tools</h3>
          <div className="resource-card">
            <div className="resource-icon">🧘‍♀️</div>
            <div>
              <div style={{ fontWeight: 600 }}>5-Minute Breathing Exercises</div>
              <div className="small">Quick techniques for stressful moments</div>
            </div>
          </div>
          <div className="resource-card">
            <div className="resource-icon">🛌</div>
            <div>
              <div style={{ fontWeight: 600 }}>Sleep Strategies</div>
              <div className="small">Maximizing rest with a newborn</div>
            </div>
          </div>
          <div className="resource-card">
            <div className="resource-icon">🍎</div>
            <div>
              <div style={{ fontWeight: 600 }}>Nutrition Guide</div>
              <div className="small">Postpartum meal ideas and tips</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
