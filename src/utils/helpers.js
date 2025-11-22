export function formatDateTime(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }
  
  export function getMoodEmoji(mood) {
    const emojis = {
      happy: "😊",
      sad: "😔",
      anxious: "😰",
      tired: "😴",
      angry: "😠",
      calm: "😌",
    };
    return emojis[mood] || "😐";
  }
  