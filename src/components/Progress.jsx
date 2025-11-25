import React, { useState, useEffect } from "react";

export default function Progress() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [moodData, setMoodData] = useState([]);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });
  const [goals, setGoals] = useState({ monthlyGoal: 20, currentProgress: 0 });
  const [stats, setStats] = useState({
    entries: 0,
    mood: 0,
    positiveDays: 0,
    meditation: 0
  });

  // Generate realistic mock data
  const generateMoodData = (days) => {
    const data = [];
    let currentMood = 4 + Math.random() * 2; // Start between 4-6
    
    for (let i = 0; i < days; i++) {
      // Mood tends to continue with small variations
      currentMood += (Math.random() - 0.5) * 0.8;
      currentMood = Math.max(1, Math.min(7, currentMood)); // Clamp between 1-7
      
      data.push({
        day: i + 1,
        date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000),
        mood: Number(currentMood.toFixed(1)),
        activities: Math.floor(Math.random() * 6),
        meditation: Math.random() > 0.7, // 30% chance of meditation
        notes: Math.random() > 0.8 // 20% chance of having notes
      });
    }
    return data;
  };

  const calculateStats = (data) => {
    const entries = data.length;
    const mood = data.reduce((sum, day) => sum + day.mood, 0) / entries;
    const positiveDays = data.filter(day => day.mood >= 5).length;
    const meditation = data.filter(day => day.meditation).length;
    
    return {
      entries,
      mood: Number(mood.toFixed(1)),
      positiveDays: Math.round((positiveDays / entries) * 100),
      meditation
    };
  };

  const calculateStreak = (data) => {
    // Sort by date descending (most recent first)
    const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate streaks based on consecutive days with entries
    const today = new Date();
    let expectedDate = new Date(today);
    
    for (let i = 0; i < sortedData.length; i++) {
      const entryDate = new Date(sortedData[i].date);
      expectedDate.setDate(today.getDate() - i);
      
      // Check if dates match (consecutive)
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return {
      current: currentStreak,
      longest: longestStreak
    };
  };

  const calculateProgress = (data, monthlyGoal) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyEntries = data.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    
    return monthlyEntries.length;
  };

  const getMoodTrend = (currentData, previousData) => {
    if (previousData.length === 0) return 0;
    
    const currentAvg = currentData.reduce((sum, day) => sum + day.mood, 0) / currentData.length;
    const previousAvg = previousData.reduce((sum, day) => sum + day.mood, 0) / previousData.length;
    
    return Number(((currentAvg - previousAvg) / previousAvg * 100).toFixed(1));
  };

  // Initialize and update data when period changes
  useEffect(() => {
    const days = selectedPeriod === "week" ? 7 : 30;
    const previousDays = selectedPeriod === "week" ? 7 : 30;
    
    const currentPeriodData = generateMoodData(days);
    const previousPeriodData = generateMoodData(previousDays);
    
    setMoodData(currentPeriodData);
    setStats(calculateStats(currentPeriodData));
    setStreakData(calculateStreak(currentPeriodData));
    
    const progress = calculateProgress(currentPeriodData, goals.monthlyGoal);
    setGoals(prev => ({ ...prev, currentProgress: progress }));
    
    // Store trend data for display
    setMoodTrend(getMoodTrend(currentPeriodData, previousPeriodData));
  }, [selectedPeriod]);

  const [moodTrend, setMoodTrend] = useState(0);

  const handleAddEntry = () => {
    // Simulate adding a new entry with realistic data
    const newEntry = {
      day: moodData.length + 1,
      date: new Date(),
      mood: Number((4 + Math.random() * 2).toFixed(1)),
      activities: Math.floor(Math.random() * 6),
      meditation: Math.random() > 0.7,
      notes: false
    };
    
    const newMoodData = [newEntry, ...moodData.slice(0, -1)]; // Replace oldest entry
    setMoodData(newMoodData);
    setStats(calculateStats(newMoodData));
    setStreakData(calculateStreak(newMoodData));
    
    const progress = calculateProgress(newMoodData, goals.monthlyGoal);
    setGoals(prev => ({ ...prev, currentProgress: progress }));
    
    alert(`New entry added! Mood: ${newEntry.mood}/7, Activities: ${newEntry.activities}`);
  };

  const handleSetGoal = () => {
    const newGoal = prompt("Set your monthly goal (number of entries):", goals.monthlyGoal);
    if (newGoal && !isNaN(newGoal)) {
      const goalNum = parseInt(newGoal);
      if (goalNum > 0 && goalNum <= 100) {
        setGoals(prev => ({ ...prev, monthlyGoal: goalNum }));
      } else {
        alert("Please enter a number between 1 and 100");
      }
    }
  };

  const handleShareProgress = () => {
    const periodText = selectedPeriod === "week" ? "week" : "month";
    const message = `I've logged ${stats.entries} entries this ${periodText} with an average mood of ${stats.mood}/7! 🎉`;
    alert(`Share your progress: ${message}`);
  };

  const getMoodColor = (moodScore) => {
    if (moodScore >= 6) return "var(--success)";
    if (moodScore >= 5) return "var(--warning)";
    if (moodScore >= 4) return "var(--accent)";
    return "var(--error)";
  };

  const getProgressPercentage = () => {
    return Math.min((goals.currentProgress / goals.monthlyGoal) * 100, 100);
  };

  const getMoodEmoji = (moodScore) => {
    if (moodScore >= 6) return "😊";
    if (moodScore >= 5) return "🙂";
    if (moodScore >= 4) return "😐";
    if (moodScore >= 3) return "😕";
    return "😢";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <section className="module" data-module="progress">
      <div className="module-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0 }}>Progress Tracking</h2>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Monitor your well-being journey</div>
          </div>
          
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              className={`period-btn ${selectedPeriod === "week" ? "active" : ""}`}
              onClick={() => setSelectedPeriod("week")}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid var(--border)",
                background: selectedPeriod === "week" ? "var(--primary)" : "transparent",
                color: selectedPeriod === "week" ? "white" : "var(--text)",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Week
            </button>
            <button 
              className={`period-btn ${selectedPeriod === "month" ? "active" : ""}`}
              onClick={() => setSelectedPeriod("month")}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid var(--border)",
                background: selectedPeriod === "month" ? "var(--primary)" : "transparent",
                color: selectedPeriod === "month" ? "white" : "var(--text)",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
        <button 
          onClick={handleAddEntry}
          style={{
            padding: "0.75rem 1rem",
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            flex: 1
          }}
        >
          + Add Today's Entry
        </button>
        <button 
          onClick={handleShareProgress}
          style={{
            padding: "0.75rem 1rem",
            background: "var(--bg-muted)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Share Progress
        </button>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>{selectedPeriod === "week" ? "Weekly" : "Monthly"} Summary</h3>
          <div className="small" style={{ color: "var(--muted)" }}>
            {selectedPeriod === "week" ? "This week" : "This month"}
          </div>
        </div>
        
        <div className="stats-grid">
          <div 
            className="stat-card"
            style={{ cursor: "pointer" }}
            onClick={() => alert(`You've made ${stats.entries} entries in the last ${selectedPeriod === 'week' ? '7 days' : '30 days'}`)}
          >
            <div className="stat-value">{stats.entries}</div>
            <div className="stat-label">Entries</div>
            <div className="small" style={{ color: "var(--muted)", marginTop: "0.25rem" }}>
              {selectedPeriod === 'week' ? '7 days' : '30 days'}
            </div>
          </div>
          
          <div 
            className="stat-card"
            style={{ cursor: "pointer" }}
            onClick={() => alert(`Your average mood is ${stats.mood}/7 ${getMoodEmoji(stats.mood)}`)}
          >
            <div 
              className="stat-value"
              style={{ color: getMoodColor(stats.mood) }}
            >
              {stats.mood}
            </div>
            <div className="stat-label">Avg. Mood</div>
            <div className="small" style={{ color: "var(--muted)", marginTop: "0.25rem" }}>
              {getMoodEmoji(stats.mood)} /7
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value" style={{ color: stats.positiveDays >= 70 ? "var(--success)" : "var(--warning)" }}>
              {stats.positiveDays}%
            </div>
            <div className="stat-label">Positive Days</div>
            <div className="small" style={{ color: "var(--muted)", marginTop: "0.25rem" }}>
              Mood ≥ 5/7
            </div>
          </div>
          
          <div 
            className="stat-card"
            style={{ cursor: "pointer" }}
            onClick={() => alert(`You've completed ${stats.meditation} meditation sessions`)}
          >
            <div className="stat-value">{stats.meditation}</div>
            <div className="stat-label">Meditation</div>
            <div className="small" style={{ color: "var(--muted)", marginTop: "0.25rem" }}>
              Sessions
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="grid cols-2">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>Consistency Streak</h3>
            <button 
              onClick={() => alert(`Your longest streak is ${streakData.longest} days! 🏆`)}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              View History
            </button>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: streakData.current > 0 ? "var(--success)" : "var(--muted)" }}>
              {streakData.current}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Days in a row</div>
              <div className="small">
                {streakData.current > 0 
                  ? `You've logged your mood for ${streakData.current} consecutive days`
                  : "Start logging to build your streak!"
                }
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span className="small">Monthly Goal Progress</span>
              <span className="small" style={{ fontWeight: 600 }}>
                {goals.currentProgress}/{goals.monthlyGoal} entries
              </span>
            </div>
            <div 
              className="progress-bar" 
              style={{ 
                marginTop: 0,
                cursor: "pointer"
              }}
              onClick={handleSetGoal}
            >
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${getProgressPercentage()}%`,
                  background: getProgressPercentage() >= 100 ? "var(--success)" : "var(--accent)"
                }} 
              />
            </div>
            <div className="small" style={{ textAlign: "center", marginTop: 8 }}>
              {Math.round(getProgressPercentage())}% of your monthly goal
              <br />
              <button 
                onClick={handleSetGoal}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary)",
                  cursor: "pointer",
                  fontSize: "12px",
                  marginTop: "0.25rem"
                }}
              >
                Adjust goal
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "1rem" }}>Mood Trend</h3>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
            <div style={{ 
              fontSize: 32, 
              fontWeight: 700, 
              color: moodTrend > 0 ? "var(--success)" : moodTrend < 0 ? "var(--error)" : "var(--muted)" 
            }}>
              {moodTrend > 0 ? '+' : ''}{moodTrend}%
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>
                {moodTrend > 0 ? 'Improving' : moodTrend < 0 ? 'Needs attention' : 'Stable'}
              </div>
              <div className="small">
                {moodTrend > 0 
                  ? 'Your average mood has improved' 
                  : moodTrend < 0 
                    ? 'Your average mood has decreased'
                    : 'Your mood is stable'
                }
              </div>
            </div>
          </div>
          
          <div className="chart-placeholder" style={{ height: 100, marginTop: 12 }}>
            <div style={{ display: "flex", height: "100%", alignItems: "end", gap: 4 }}>
              {moodData.map((day, index) => (
                <div
                  key={day.day}
                  style={{
                    flex: 1,
                    background: getMoodColor(day.mood),
                    height: `${(day.mood / 7) * 100}%`,
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    opacity: 0.8
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  onClick={() => alert(
                    `${formatDate(day.date)}\nMood: ${day.mood}/7 ${getMoodEmoji(day.mood)}\nActivities: ${day.activities}\nMeditation: ${day.meditation ? 'Yes' : 'No'}\nNotes: ${day.notes ? 'Yes' : 'No'}`
                  )}
                />
              ))}
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
            <span className="small" style={{ color: "var(--muted)" }}>
              {selectedPeriod === "week" ? "Last 7 days" : "Last 30 days"}
            </span>
            <span className="small" style={{ color: "var(--muted)" }}>
              Click for details
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ height: 18 }} />
      
      <div className="card">
        <h3>Recent Activity</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
          {moodData.slice(0, 3).map((day, index) => (
            <div key={day.day} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="small">
                {formatDate(day.date)}: {day.mood}/7 {getMoodEmoji(day.mood)}
              </span>
              <span className="small" style={{ 
                color: day.meditation ? "var(--success)" : "var(--muted)" 
              }}>
                {day.meditation ? "Meditated" : "No meditation"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}