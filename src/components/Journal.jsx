// Journal.jsx
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
    
    // Clear existing bars
    canvas.innerHTML = '';
    
    // Create new bars
    for (let i = 0; i < 20; i++) {
      const bar = document.createElement("div");
      bar.className = "audio-bar";
      bar.style.height = "10%";
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
        const height = isRecording ? Math.floor(Math.random() * 90) + 10 : 10;
        bar.style.height = `${height}%`;
      });
      if (isRecording) {
        animationRef.current = requestAnimationFrame(update);
      }
    }
    update();
  }

  // Initialize browser SpeechRecognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      setTranscript(finalTranscriptRef.current + interimTranscript);
      setUseTranscriptEnabled(finalTranscriptRef.current.length > 0);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error', event.error);
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
        
        // If we have final transcript from browser API, use it
        if (finalTranscriptRef.current.trim()) {
          setTranscript(finalTranscriptRef.current.trim());
          setUseTranscriptEnabled(true);
        } else {
          // Otherwise try Hugging Face API
          try {
            const apiKey = ""; // Add your Hugging Face API key here if you have one
            const text = await transcribeAudioBlob(audioBlob, { apiKey });
            setTranscript(text || "No transcription returned");
            setUseTranscriptEnabled(true);
          } catch (err) {
            setTranscript("Transcription completed. No API key configured for automatic transcription.");
            setUseTranscriptEnabled(true);
          }
        }

        stream.getTracks().forEach((t) => t.stop());
      };

      // Start browser SpeechRecognition if available
      recognitionRef.current = initSpeechRecognition();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn("Speech recognition start failed:", err);
        }
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(updateRecordingTime, 1000);
      setTranscript("Listening...");
      animateVisualizer();

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Speech recognition stop failed:", err);
      }
    }

    setIsRecording(false);
    clearInterval(timerRef.current);
    setRecordingTime("00:00");
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const bars = document.querySelectorAll(".audio-bar");
    bars.forEach((b) => (b.style.height = "10%"));

    // If no transcript was captured, show a message
    if (!finalTranscriptRef.current.trim()) {
      setTranscript("Recording completed. Speak clearly next time for better transcription.");
    }
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
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
    alert("Journal saved (local demo)");
    
    // Clear form
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

  return (
    <section className="module" data-module="journal">
      <div className="module-header">
        <h2 style={{ margin: 0 }}>Journal</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Your emotional diary</div>
      </div>

      <div className="card auth">
        <h3 style={{ marginTop: 0 }}>New Journal Entry</h3>

        <label>Title</label>
        <input 
          type="text" 
          id="entryTitle" 
          placeholder="How are you feeling today?" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />

        <label style={{ marginTop: 8 }}>Mood</label>
        <select id="entryMood" value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="happy">😊 Happy</option>
          <option value="sad">😔 Sad</option>
          <option value="anxious">😰 Anxious</option>
          <option value="tired">😴 Tired</option>
          <option value="angry">😠 Angry</option>
          <option value="calm">😌 Calm</option>
        </select>

        <label style={{ marginTop: 8 }}>Detailed note</label>
        <textarea 
          id="entryNote" 
          placeholder="Write as little or as much as you like" 
          value={note} 
          onChange={(e) => setNote(e.target.value)} 
        />

        <div className="voice-recorder">
          <h4 style={{ marginTop: 0 }}>Voice Journaling</h4>
          <p className="small" style={{ marginBottom: 12 }}>
            Record your thoughts instead of typing {!window.SpeechRecognition && !window.webkitSpeechRecognition && 
              "(Note: Real-time transcription works best in Chrome/Edge)"}
          </p>

          <div className="recording-controls">
            <button 
              className={`record-btn ${isRecording ? "recording" : ""}`} 
              id="recordBtn" 
              onClick={toggleRecording}
            >
              <span id="recordIcon">{isRecording ? "■" : "●"}</span>
            </button>
            <div id="recordingStatus">
              {isRecording ? "Recording... Speak now" : "Ready to record"}
            </div>
            <div id="recordingTime">{recordingTime}</div>
          </div>

          <div className="audio-visualizer" id="audioVisualizer">
            {/* Bars are created by useEffect */}
          </div>

          <div className="transcript" id="transcriptContainer">
            <div className="small" style={{ marginBottom: 6 }}>Transcript:</div>
            <div id="transcriptText" style={{ minHeight: "60px" }}>
              {transcript}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button 
              className="btn btn-primary" 
              id="useTranscript" 
              disabled={!useTranscriptEnabled} 
              onClick={useTranscript}
            >
              Use Transcript
            </button>
            <button className="btn btn-ghost" id="clearRecording" onClick={clearRecording}>
              Clear
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button className="btn btn-primary" id="saveEntry" onClick={saveEntry}>
            Save Entry
          </button>
          <button 
            className="btn btn-ghost" 
            id="cancelEntry" 
            onClick={() => { 
              setTitle(""); 
              setNote(""); 
              setTranscript("No transcript yet");
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="card">
        <h3>All journal entries</h3>
        <div id="journalList">
          {entries.map(entry => (
            <div key={entry.id} className="entry">
              <div style={{ fontWeight: 600 }}>
                {entry.title} 
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  • {entry.mood}
                </span>
              </div>
              <div className="meta">{new Date(entry.date).toLocaleString()}</div>
              <div style={{ marginTop: 6, color: "var(--muted)" }}>
                {entry.note}
                {entry.transcript && entry.transcript !== "No transcript yet" && (
                  <div style={{ marginTop: 8, fontStyle: 'italic', fontSize: '12px' }}>
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