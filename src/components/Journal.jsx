// Journal.jsx (UI enhanced — no feature changes)
import React, { useEffect, useRef, useState } from "react";
import { transcribeAudioBlob } from "../utils/whisper";

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("happy");
  const [note, setNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00");
  const [transcript, setTranscript] = useState("No transcript yet");
  const [useTranscriptEnabled, setUseTranscriptEnabled] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  // Load entries on mount
  useEffect(() => {
    const arr = JSON.parse(localStorage.getItem("pc_demo_entries_v1") || "[]");
    setEntries(arr.sort((a,b) => new Date(b.date) - new Date(a.date)));
  }, []);

  // Create audio visualizer bars
  useEffect(() => {
    const canvas = document.querySelector(".audio-visualizer");
    if (!canvas) return;
    canvas.innerHTML = '';

    for (let i = 0; i < 25; i++) {
      const bar = document.createElement("div");
      bar.className = "audio-bar";
      bar.style.height = "12%";
      bar.style.width = "4px";
      bar.style.borderRadius = "6px";
      bar.style.background = "var(--accent)";
      canvas.appendChild(bar);
    }
  }, []);

  function updateRecordingTime() {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
    const seconds = (elapsed % 60).toString().padStart(2, "0");
    setRecordingTime(`${minutes}:${seconds}`);
  }

  function animateVisualizer() {
    const bars = document.querySelectorAll(".audio-bar");

    function update() {
      bars.forEach((bar) => {
        const height = isRecording
          ? Math.floor(Math.random() * 85) + 15
          : 12;
        bar.style.height = `${height}%`;
      });
      if (isRecording) animationRef.current = requestAnimationFrame(update);
    }
    update();
  }

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscriptRef.current += text + ' ';
        else interimTranscript += text;
      }

      setTranscript(finalTranscriptRef.current + interimTranscript);
      setUseTranscriptEnabled(finalTranscriptRef.current.length > 0);
    };

    return recognition;
  };

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      finalTranscriptRef.current = "";

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });

        if (finalTranscriptRef.current.trim()) {
          setTranscript(finalTranscriptRef.current.trim());
          setUseTranscriptEnabled(true);
        } else {
          try {
            const text = await transcribeAudioBlob(audioBlob, { apiKey: "" });
            setTranscript(text || "No transcription returned");
            setUseTranscriptEnabled(true);
          } catch {
            setTranscript(
              "Transcription finished (No API key connected for Whisper)."
            );
            setUseTranscriptEnabled(true);
          }
        }

        stream.getTracks().forEach((t) => t.stop());
      };

      recognitionRef.current = initSpeechRecognition();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(updateRecordingTime, 1000);
      setTranscript("Listening...");
      animateVisualizer();

    } catch (err) {
      alert("Microphone permission denied. Enable it and try again.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setIsRecording(false);
    clearInterval(timerRef.current);
    setRecordingTime("00:00");
    cancelAnimationFrame(animationRef.current);

    document.querySelectorAll(".audio-bar").forEach((b) => {
      b.style.height = "12%";
    });

    if (!finalTranscriptRef.current.trim()) {
      setTranscript("Recording completed — speak a bit louder next time.");
    }
  }

  function toggleRecording() {
    isRecording ? stopRecording() : startRecording();
  }

  function saveEntry() {
    const arr = JSON.parse(localStorage.getItem("pc_demo_entries_v1") || "[]");

    const newEntry = {
      id: Date.now(),
      title: title || "Untitled",
      mood,
      note: note || "",
      date: new Date().toISOString(),
      transcript: transcript !== "No transcript yet" ? transcript : "",
    };

    arr.push(newEntry);
    localStorage.setItem("pc_demo_entries_v1", JSON.stringify(arr));
    setEntries(arr.sort((a,b) => new Date(b.date) - new Date(a.date)));

    alert("Journal saved ❤️");

    // reset
    setTitle("");
    setNote("");
    setMood("happy");
    setTranscript("No transcript yet");
    setUseTranscriptEnabled(false);
  }

  function useTranscript() {
    setNote(transcript);
  }

  function clearRecording() {
    setTranscript("No transcript yet");
    setUseTranscriptEnabled(false);
    setRecordingTime("00:00");
    finalTranscriptRef.current = "";
  }

  const buttonStyles = {
    primary: {
      background: "linear-gradient(135deg, #a78bfa, #c084fc)",
      color: "white",
      padding: "12px 24px",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
      transition: "0.25s",
      boxShadow: "0 4px 14px rgba(168, 85, 247, 0.25)"
    },
    ghost: {
      background: "rgba(255,255,255,0.08)",
      color: "#ddd",
      padding: "10px 20px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.15)",
      cursor: "pointer",
      transition: "0.25s"
    },
    record: {
      background: isRecording
        ? "linear-gradient(135deg, #fb7185, #ef4444)"
        : "linear-gradient(135deg, #818cf8, #6366f1)",
      color: "white",
      padding: "18px",
      borderRadius: "50%",
      width: "65px",
      height: "65px",
      border: "none",
      cursor: "pointer",
      fontSize: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: isRecording
        ? "0 4px 18px rgba(239,68,68,0.35)"
        : "0 4px 18px rgba(99,102,241,0.35)"
    }
  };

  return (
    <section className="module" data-module="journal">
      <div className="module-header">
        <h2>Journal</h2>
        <div className="subtext">Your emotional diary</div>
      </div>

      {/* New Entry */}
      <div className="card card-enhanced">
        <h3>New Journal Entry</h3>

        <label>Title</label>
        <input 
          type="text"
          placeholder="How are you feeling today?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Mood</label>
        <select value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="happy">😊 Happy</option>
          <option value="sad">😔 Sad</option>
          <option value="anxious">😰 Anxious</option>
          <option value="tired">😴 Tired</option>
          <option value="angry">😠 Angry</option>
          <option value="calm">😌 Calm</option>
        </select>

        <label>Detailed note</label>
        <textarea
          placeholder="Write whatever you want…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {/* Voice Journal */}
        <div className="voice-recorder">
          <h4>Voice Journaling</h4>
          <p className="small">Record your thoughts instead of typing</p>

          <div className="recording-controls">
            <button
              style={buttonStyles.record}
              onClick={toggleRecording}
            >
              {isRecording ? "■" : "●"}
            </button>

            <div className="record-info">
              <div className="status">
                {isRecording ? "Recording…" : "Ready to record"}
              </div>
              <div className="time">{recordingTime}</div>
            </div>
          </div>

          <div className="audio-visualizer"></div>

          <div className="transcript-box fade-in">
            <div className="label">Transcript:</div>
            <div className="content">{transcript}</div>
          </div>

          <div className="button-row">
            <button
              style={{ 
                ...buttonStyles.primary,
                opacity: useTranscriptEnabled ? 1 : 0.5
              }}
              disabled={!useTranscriptEnabled}
              onClick={useTranscript}
            >
              🎤 Use Transcript
            </button>

            <button style={buttonStyles.ghost} onClick={clearRecording}>
              🗑️ Clear
            </button>
          </div>
        </div>

        <div className="button-row" style={{ marginTop: 10 }}>
          <button style={buttonStyles.primary} onClick={saveEntry}>
            💾 Save Entry
          </button>
          <button style={buttonStyles.ghost} onClick={() => {
            setTitle(""); setNote(""); setTranscript("No transcript yet");
          }}>
            ❌ Cancel
          </button>
        </div>
      </div>

      {/* Past Entries */}
      <div className="card card-enhanced">
        <h3>All Journal Entries</h3>

        <div className="entries-list">
          {entries.map(entry => (
            <div key={entry.id} className="entry-item">
              <div className="entry-header">
                <span className="title">{entry.title}</span>
                <span className="mood">• {entry.mood}</span>
              </div>

              <div className="meta">
                {new Date(entry.date).toLocaleString()}
              </div>

              <div className="content">
                {entry.note}

                {entry.transcript && (
                  <div className="transcript-snippet">
                    <strong>Voice transcript:</strong> {entry.transcript}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
