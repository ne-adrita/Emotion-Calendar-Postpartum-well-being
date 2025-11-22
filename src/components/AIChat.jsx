// AIChat.jsx (with real Hugging Face AI)
import React, { useState, useRef, useEffect } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState([
    { id: 0, sender: "ai", text: "Hi! I'm your emotional wellness assistant. How are you feeling today? You can share anything on your mind." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Your Hugging Face API key - get one from https://huggingface.co/settings/tokens
  const API_KEY = "hf_vXMzE6Nvw0XPenzT06CP8kcFAL3AIxmjcc"; // Replace with your actual API key

  // Available models - you can switch between these
  const MODELS = {
    DIALOGPT: "microsoft/DialoGPT-medium",
    BLOOM: "bigscience/bloom-560m",
    GPT2: "gpt2",
    DISTILGPT: "distilgpt2"
  };

  const CURRENT_MODEL = MODELS.DIALOGPT;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real AI response using Hugging Face API
  const getAIResponse = async (userMessage) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      // Build conversation context
      const conversationHistory = messages
        .slice(-4) // Last 4 messages for context
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');

      const prompt = `You are a compassionate postpartum support assistant. Provide warm, understanding, and practical responses to new parents.

Previous conversation:
${conversationHistory}

User: ${userMessage}

Assistant:`;

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${CURRENT_MODEL}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 120,
              temperature: 0.8,
              do_sample: true,
              repetition_penalty: 1.1,
              top_p: 0.9,
              return_full_text: false
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      let aiResponse = "I understand. Can you tell me more about how you're feeling?";

      if (Array.isArray(data) && data[0] && data[0].generated_text) {
        aiResponse = data[0].generated_text.trim();
        
        // Clean the response
        aiResponse = aiResponse
          .replace(/You are a compassionate postpartum support assistant[^]*?Assistant:/g, '')
          .replace(/Previous conversation[^]*?User:[^]*?Assistant:/g, '')
          .replace(/^"+|"+$/g, '')
          .replace(/Assistant:\s*/g, '')
          .trim();

        // Ensure response isn't empty after cleaning
        if (!aiResponse || aiResponse.length < 10) {
          aiResponse = "Thank you for sharing. I'm here to listen. Could you tell me more about what you're experiencing?";
        }
      }

      return aiResponse;

    } catch (error) {
      console.error("Hugging Face API error:", error);
      return getFallbackResponse(userMessage);
    }
  };

  // Fallback for when API fails
  const getFallbackResponse = (userMessage) => {
    const fallbackResponses = [
      "Thank you for sharing that with me. How are you feeling about this?",
      "I hear you. This sounds important. What's coming up for you as you share this?",
      "Thank you for trusting me with this. What would be helpful for you right now?",
      "I'm listening. This sounds meaningful. What else is on your mind?",
      "I appreciate you sharing this. How can I support you with these feelings?"
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  const addMessage = async (text, sender = "user") => {
    const newMessage = { id: Date.now(), sender, text };
    setMessages(prev => [...prev, newMessage]);
    
    if (sender === "user") {
      setIsLoading(true);
      try {
        const aiResponse = await getAIResponse(text);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: "ai", text: aiResponse }]);
      } catch (error) {
        const fallback = getFallbackResponse(text);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: "ai", text: fallback }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    addMessage(input.trim(), "user");
    setInput("");
  };

  const clearChat = () => {
    setMessages([
      { id: Date.now(), sender: "ai", text: "Hi! I'm your emotional wellness assistant. How are you feeling today? You can share anything on your mind." },
    ]);
  };

  // Conversation starters
  const conversationStarters = [
    "I'm feeling overwhelmed today",
    "I've been really anxious lately",
    "I'm exhausted and need support",
    "My baby won't stop crying",
    "I'm feeling lonely as a new parent",
    "I'm worried about my recovery",
    "I'm struggling with sleep deprivation",
    "I need help asking for support",
    "I'm feeling guilty about taking time for myself",
    "My relationship with my partner has changed"
  ];

  return (
    <section className="module" data-module="ai-chat">
      <div className="module-header">
        <h2 style={{ margin: 0 }}>AI Support Chat</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Powered by Hugging Face AI • {CURRENT_MODEL.split('/')[1]}
          <button 
            className="btn btn-ghost" 
            onClick={clearChat}
            style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px' }}
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
        {/* Main Chat Area */}
        <div className="card">
          <div className="chat-container">
            <div className="chat-header">
              <h3 style={{ margin: 0 }}>Emotional Wellness Assistant</h3>
              <div className="small">Real AI support using Hugging Face</div>
            </div>

            <div className="chat-messages" id="chatMessages">
              {messages.map(m => (
                <div key={m.id} className={`message ${m.sender === "user" ? "user-message" : "ai-message"}`}>
                  {m.text}
                </div>
              ))}
              {isLoading && (
                <div className="message ai-message">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    AI is thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
              <input 
                className="chat-input" 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyPress={(e) => { 
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Share your thoughts and feelings..." 
                disabled={isLoading}
              />
              <button 
                className="send-btn" 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Support Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Starters */}
          <div className="card">
            <h3 style={{ margin: '0 0 12px 0' }}>Quick Start</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {conversationStarters.map((starter, index) => (
                <button 
                  key={index}
                  className="btn btn-ghost quick-question" 
                  onClick={() => addMessage(starter, "user")}
                  disabled={isLoading}
                  style={{ 
                    fontSize: '12px', 
                    padding: '8px 10px',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    width: '100%',
                    lineHeight: '1.3'
                  }}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>

          {/* API Status */}
          <div className="card" style={{ background: 'rgba(139,211,199,0.1)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>🤖 AI Status</h4>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.4' }}>
              <div><strong>Model:</strong> {CURRENT_MODEL}</div>
              <div><strong>Provider:</strong> Hugging Face</div>
              <div style={{ marginTop: '8px', fontSize: '11px' }}>
                💡 Get your API key from huggingface.co
              </div>
            </div>
          </div>

          {/* Emergency Resources */}
          <div className="card" style={{ border: '1px solid var(--danger)', background: 'rgba(239,68,68,0.05)' }}>
            <h4 style={{ color: 'var(--danger)', margin: '0 0 12px 0', fontSize: '14px' }}>🆘 Immediate Help</h4>
            <div className="small" style={{ color: 'var(--muted)', lineHeight: '1.4' }}>
              <div style={{ marginBottom: '6px' }}><strong>Crisis Text Line:</strong><br />Text HOME to 741741</div>
              <div style={{ marginBottom: '6px' }}><strong>National Suicide Prevention:</strong><br />988</div>
              <div style={{ marginBottom: '8px' }}><strong>Postpartum Support International:</strong><br />1-800-944-4773</div>
            </div>
          </div>
        </div>
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