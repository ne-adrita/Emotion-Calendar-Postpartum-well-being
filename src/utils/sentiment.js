// Create src/utils/sentiment.js
export async function analyzeMood(text) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer hf_vXMzE6Nvw0XPenzT06CP8kcFAL3AIxmjcc`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );
      
      const data = await response.json();
      const sentiment = data[0]?.[0]?.label || "neutral";
      const score = data[0]?.[0]?.score || 0;
      
      return { sentiment, score };
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      return { sentiment: "neutral", score: 0 };
    }
  }