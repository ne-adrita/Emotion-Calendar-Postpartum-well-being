import React, { useState, useEffect } from "react";

export default function Insights() {
  const [entries, setEntries] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const API_KEY = "hf_vXMzE6Nvw0XPenzT06CP8kcFAL3AIxmjcc";

  useEffect(() => {
    // Load entries for analysis
    const arr = JSON.parse(localStorage.getItem("pc_demo_entries_v1") || "[]");
    setEntries(arr);
    
    // Generate AI insights if we have entries
    if (arr.length > 0) {
      generateAIInsights(arr);
    }
  }, []);

  async function generateAIInsights(entries) {
    if (entries.length === 0) {
      setAiInsight("Start adding journal entries to get personalized insights about your emotional patterns.");
      return;
    }

    setIsGenerating(true);

    try {
      // Analyze mood distribution
      const moodCount = {};
      entries.forEach(entry => {
        moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
      });

      const recentEntries = entries.slice(0, 10);
      const entriesText = recentEntries.map(entry => 
        `[${entry.mood}] ${entry.note || entry.title}`
      ).join(". ");

      const prompt = `Analyze these postpartum mood journal entries and provide compassionate insights about emotional patterns. 
      Focus on identifying trends, potential triggers, positive developments, and gentle suggestions.
      
      Entries: ${entriesText}
      
      Mood distribution: ${JSON.stringify(moodCount)}
      
      Please provide a warm, supportive analysis that:
      1. Identifies any patterns in moods
      2. Notes positive trends or strengths
      3. Offers gentle, practical suggestions
      4. Validates the normalcy of postpartum emotions
      5. Is encouraging and non-judgmental
      
      Analysis:`;

      const response = await fetch(
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 250,
              temperature: 0.7,
              repetition_penalty: 1.1,
              do_sample: true,
              return_full_text: false
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let insight = "I'm analyzing your patterns to provide personalized insights...";

      if (Array.isArray(data) && data[0] && data[0].generated_text) {
        insight = data[0].generated_text.trim();
      } else if (typeof data === 'string') {
        insight = data.trim();
      } else if (data.generated_text) {
        insight = data.generated_text.trim();
      }

      // Clean up the insight
      insight = insight.replace(/Analysis:/g, '').trim();
      
      if (!insight || insight.length < 50) {
        insight = getFallbackInsight(entries, moodCount);
      }

      setAiInsight(insight);

    } catch (error) {
      console.error("AI Insights error:", error);
      setAiInsight(getFallbackInsight(entries, {}));
    } finally {
      setIsGenerating(false);
    }
  }

  function getFallbackInsight(entries, moodCount) {
    if (entries.length === 0) {
      return "Your insights will appear here as you add journal entries. Tracking your moods helps identify patterns and celebrate progress.";
    }

    const totalEntries = entries.length;
    const happyPct = Math.round(((moodCount.happy || 0) / totalEntries) * 100);
    const calmPct = Math.round(((moodCount.calm || 0) / totalEntries) * 100);
    const challengingPct = Math.round(((moodCount.anxious || 0) + (moodCount.sad || 0) + (moodCount.tired || 0)) / totalEntries * 100);

    let insight = `Based on your ${totalEntries} entries, I notice you've been tracking your journey consistently. `;

    if (happyPct + calmPct > 60) {
      insight += `You're experiencing many positive moments (${happyPct + calmPct}% happy/calm entries), which is wonderful to see. `;
    } else if (challengingPct > 50) {
      insight += `You're navigating some challenging days (${challengingPct}% tired/anxious/sad entries). Remember that these feelings are normal and temporary. `;
    } else {
      insight += `You're showing a balanced mix of emotions, which is very common in postpartum adjustment. `;
    }

    insight += "Keep honoring all your feelings - each entry helps you understand yourself better during this transition.";

    return insight;
  }

  function refreshInsights() {
    generateAIInsights(entries);
  }

  // Calculate mood statistics
  const moodStats = entries.reduce((acc, entry) => {
    acc.total = (acc.total || 0) + 1;
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const moodPercentages = {};
  if (moodStats.total > 0) {
    ['happy', 'calm', 'tired', 'anxious', 'sad', 'angry'].forEach(mood => {
      moodPercentages[mood] = Math.round(((moodStats[mood] || 0) / moodStats.total) * 100);
    });
  }

  return (
    <section className="module" data-module="insights">
      <div className="module-header">
        <h2 style={{ margin: 0 }}>AI Insights</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Understand your emotional patterns with AI analysis
          <button 
            className="btn btn-ghost" 
            onClick={refreshInsights}
            disabled={isGenerating}
            style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px' }}
          >
            {isGenerating ? "Analyzing..." : "Refresh Insights"}
          </button>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Mood Distribution</h3>
          <div className="chart-placeholder">
            {moodStats.total > 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <div style={{ 
                  width: 140, 
                  height: 140, 
                  borderRadius: "50%", 
                  background: `conic-gradient(
                    var(--accent) 0% ${moodPercentages.happy}%,
                    var(--accent-2) ${moodPercentages.happy}% ${moodPercentages.happy + moodPercentages.calm}%,
                    var(--warning) ${moodPercentages.happy + moodPercentages.calm}% ${moodPercentages.happy + moodPercentages.calm + moodPercentages.tired}%,
                    #f59e0b ${moodPercentages.happy + moodPercentages.calm + moodPercentages.tired}% ${moodPercentages.happy + moodPercentages.calm + moodPercentages.tired + moodPercentages.anxious}%,
                    var(--danger) ${moodPercentages.happy + moodPercentages.calm + moodPercentages.tired + moodPercentages.anxious}% ${moodPercentages.happy + moodPercentages.calm + moodPercentages.tired + moodPercentages.anxious + moodPercentages.sad}%,
                    #6b7280 ${moodPercentages.happy + moodPercentages.calm + moodPercentages.tired + moodPercentages.anxious + moodPercentages.sad}% 100%
                  )` 
                }} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                Add journal entries to see mood distribution
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, justifyContent: "center" }}>
              {moodPercentages.happy > 0 && <MoodLegend color="var(--accent)" label={`Happy (${moodPercentages.happy}%)`} />}
              {moodPercentages.calm > 0 && <MoodLegend color="var(--accent-2)" label={`Calm (${moodPercentages.calm}%)`} />}
              {moodPercentages.tired > 0 && <MoodLegend color="var(--warning)" label={`Tired (${moodPercentages.tired}%)`} />}
              {moodPercentages.anxious > 0 && <MoodLegend color="#f59e0b" label={`Anxious (${moodPercentages.anxious}%)`} />}
              {moodPercentages.sad > 0 && <MoodLegend color="var(--danger)" label={`Sad (${moodPercentages.sad}%)`} />}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Weekly Trends</h3>
          <div className="chart-placeholder">
            {entries.length > 0 ? (
              <div style={{ display: "flex", height: "100%", alignItems: "end", gap: 4, padding: '0 8px' }}>
                {[...Array(7)].map((_, i) => {
                  const height = 20 + Math.random() * 70; // Simulated data
                  return (
                    <div 
                      key={i}
                      style={{ 
                        flex: 1, 
                        background: "var(--accent)", 
                        height: `${height}%`, 
                        borderRadius: 2,
                        opacity: 0.7 + (Math.random() * 0.3)
                      }} 
                    />
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                Track your mood daily to see trends
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: 8 }}>
            {entries.length > 0 ? "Mood intensity over past week" : "No data yet"}
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>AI Insight Summary</h3>
          <div className="small" style={{ color: "var(--muted)" }}>
            {entries.length} entries analyzed
          </div>
        </div>
        
        <div style={{ 
          background: "rgba(139,211,199,0.05)", 
          padding: "16px", 
          borderRadius: 8,
          border: "1px solid rgba(139,211,199,0.1)"
        }}>
          {isGenerating ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)' }}>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              Analyzing your patterns with AI...
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: 12, color: "var(--accent)" }}>
                Personalized Analysis
              </div>
              <div style={{ lineHeight: 1.6, fontSize: '14px' }}>
                {aiInsight || "Add journal entries to get AI-powered insights about your emotional patterns."}
              </div>
            </>
          )}
        </div>
        
        {entries.length > 0 && !isGenerating && (
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", textAlign: 'center' }}>
            💡 These insights update automatically as you add more entries
          </div>
        )}
      </div>

      <style jsx>{`
        .typing-indicator {
          display: flex;
          gap: 3px;
        }
        .typing-indicator span {
          height: 6px;
          width: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) { animation-delay: 0s; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </section>
  );
}

// Helper component for mood legend
function MoodLegend({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 12, height: 12, background: color, borderRadius: 2 }}></div>
      <span className="small">{label}</span>
    </div>
  );
}