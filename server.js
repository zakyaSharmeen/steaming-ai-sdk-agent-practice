///////////////////////////////////////////

import dotenv from "dotenv";
import { streamText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

dotenv.config({ quiet: true });

// OpenRouter setup
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// ✅ Tool is defined separately
const getThoughtOfDay = tool({
  description: "Returns a motivational thought of the day",
  parameters: {}, // no input needed
  execute: async () => {
    const thoughts = [
      "Small steps today lead to big results tomorrow.",
      "Stay calm—confidence improves performance.",
      "You’ve prepared more than you think.",
      "Focus on effort, not fear.",
    ];

    return thoughts[Math.floor(Math.random() * thoughts.length)];
  },
});

// System prompt
const systemPrompt = `
You are a motivational assistant.

You MUST use the getThoughtOfDay tool in every response.

Do not answer without calling the tool first.
`;

// Agent
export const runAgent = async (input) => {
  try {
    const result = await streamText({
      model: openrouter("openai/gpt-4o-mini"),
      system: systemPrompt,
      prompt: input,
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
  } catch (err) {
    console.error("FULL ERROR:", err?.response?.data || err);
  }
};

// Main
const main = async () => {
  const query = "I have an exam tomorrow";

  console.log("🤖 Agent:\n");
  await runAgent(query);
};

main();
