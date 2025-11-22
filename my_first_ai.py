# Import the AI tools
from transformers import pipeline

# Set up your Hugging Face token
import os
os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_vXMzE6Nvw0XPenzT06CP8kcFAL3AIxmjcc"

print("🤖 Welcome to your first AI program!")
print("Loading AI model...")

# Create a sentiment analyzer (understands if text is positive/negative)
classifier = pipeline('sentiment-analysis')

# Test it with some text
results = classifier(["I love this tutorial!", "This is terrible.", "I'm feeling okay."])

# Show the results
print("\n📊 AI Analysis Results:")
for text, result in zip(["I love this tutorial!", "This is terrible.", "I'm feeling okay."], results):
    print(f"Text: '{text}'")
    print(f"Sentiment: {result['label']}")
    print(f"Confidence: {result['score']:.2f}")
    print("---")

print("\n🎉 Congratulations! You just used AI!")