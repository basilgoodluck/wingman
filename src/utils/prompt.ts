import Together from "together-ai";
import dotenv from "dotenv";

dotenv.config();

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

const generateResponse = async (prompt: string): Promise<any> => {
  try {
    const modifiedPrompt = `${prompt} (Keep your response short, under 2 sentences.)`;

    const response = await together.chat.completions.create({
      messages: [{ role: "user", content: modifiedPrompt }],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      max_tokens: 60, 
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      stop: [".", "!", "?"],
    });

    let text = response.choices[0].message?.content || "Error generating response";
    
    if (!/[.!?]$/.test(text)) {
      text += ".";
    }

    console.log(text);
    return text;
  } catch (error: any) {
    console.log(error);
    return "Error generating response.";
  }
};

export default generateResponse;