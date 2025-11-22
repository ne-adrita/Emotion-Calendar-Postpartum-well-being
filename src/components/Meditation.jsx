// Meditation.jsx
import React, { useState, useRef, useEffect } from "react";

export default function Meditation() {
  const [running, setRunning] = useState(false);
  const [phaseText, setPhaseText] = useState("Breathe in slowly...");
  const [circleScale, setCircleScale] = useState(1);
  const [buttonText, setButtonText] = useState("Start Exercise");
  
  const intervalRef = useRef(null);
  const phaseRef = useRef(0);

  const phases = [
    { text: "Breathe in slowly...", scale: 1.5, duration: 4000 },
    { text: "Hold...", scale: 1.5, duration: 2000 },
    { text: "Breathe out slowly...", scale: 1, duration: 5000 },
    { text: "Hold...", scale: 1, duration: 2000 }
  ];

  const startBreathing = () => {
    if (running) {
      stopBreathing();
      return;
    }

    setRunning(true);
    setButtonText("Stop Exercise");
    phaseRef.current = 0;
    updateBreathing();
    
    // Total cycle time is sum of all phase durations
    const totalCycleTime = phases.reduce((total, phase) => total + phase.duration, 0);
    intervalRef.current = setInterval(updateBreathing, totalCycleTime);
  };

  const updateBreathing = () => {
    const current = phases[phaseRef.current];
    setPhaseText(current.text);
    setCircleScale(current.scale);
    
    phaseRef.current = (phaseRef.current + 1) % phases.length;
  };

  const stopBreathing = () => {
    setRunning(false);
    setButtonText("Start Exercise");
    setPhaseText("Breathe in slowly...");
    setCircleScale(1);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <section className="module" data-module="meditation">
      <div className="module-header">
        <h2 style={{ margin: 0 }}>Meditation & Mindfulness</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Tools for mental well-being</div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Guided Sessions</h3>
          <div className="resource-card">
            <div className="resource-icon">🎧</div>
            <div>
              <div style={{ fontWeight: 600 }}>5-Minute Breathing</div>
              <div className="small">Quick reset for stressful moments</div>
              <button className="btn btn-primary" style={{ marginTop: 8, padding: "6px 12px", fontSize: 12 }}>
                Start
              </button>
            </div>
          </div>
          <div className="resource-card">
            <div className="resource-icon">🎧</div>
            <div>
              <div style={{ fontWeight: 600 }}>Sleep Meditation</div>
              <div className="small">For restful nights</div>
              <button className="btn btn-primary" style={{ marginTop: 8, padding: "6px 12px", fontSize: 12 }}>
                Start
              </button>
            </div>
          </div>
          <div className="resource-card">
            <div className="resource-icon">🎧</div>
            <div>
              <div style={{ fontWeight: 600 }}>Anxiety Relief</div>
              <div className="small">Calming techniques</div>
              <button className="btn btn-primary" style={{ marginTop: 8, padding: "6px 12px", fontSize: 12 }}>
                Start
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Breathing Exercise</h3>
          <div style={{ textAlign: "center", padding: 20 }}>
            <div 
              style={{ 
                width: 120, 
                height: 120, 
                borderRadius: "50%", 
                border: "3px solid var(--accent)", 
                margin: "0 auto 20px", 
                display: "grid", 
                placeItems: "center", 
                fontSize: 24,
                transform: `scale(${circleScale})`,
                transition: "transform 4s ease-in-out"
              }}
            >
              Breathe
            </div>
            <div style={{ marginBottom: 12 }}>{phaseText}</div>
            <button className="btn btn-primary" onClick={startBreathing}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}