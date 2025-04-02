import Together from "together-ai";
import dotenv from "dotenv";

dotenv.config();

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

type ChatMessage = {
  role: "user" | "system" | "assistant" | "tool";
  content: string;
};

const chatHistories: { [userId: string]: ChatMessage[] } = {};

const generateResponse = async (prompt: string, userId: string): Promise<string> => {
  try {
    if (!chatHistories[userId]) {
      chatHistories[userId] = [];
    }

    chatHistories[userId].push({ role: "user", content: prompt });

    if (chatHistories[userId].length > 10) {
      chatHistories[userId] = chatHistories[userId].slice(-10);
    }

    const response = await together.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant. Keep responses short, under 2 sentences." },
        ...chatHistories[userId],
      ],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      max_tokens: 60,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      stop: [".", "!", "?"],
    });

    let text = response.choices[0].message?.content || "Error generating response.";
    
    if (!/[.!?]$/.test(text)) {
      text += ".";
    }

    chatHistories[userId].push({ role: "assistant", content: text });

    console.log(text);
    return text;
  } catch (error: any) {
    console.log(error);
    return "Error generating response.";
  }
};

const clearHistory = (userId: string): void => {
  delete chatHistories[userId];
};

export { generateResponse, clearHistory };