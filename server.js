// case-1
// without tool

// import { streamText } from "ai";
// import { createOpenAI } from "@ai-sdk/openai";
// import dotenv from "dotenv";

// dotenv.config({ quiet: true });

// // OpenRouter client
// const openrouter = createOpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: process.env.OPENROUTER_API_KEY,
//   headers: {
//     "HTTP-Referer": "http://localhost:3000",
//     "X-Title": "Simple App",
//   },
// });

// // Simple streaming
// const { textStream } = await streamText({
//   model: openrouter("anthropic/claude-opus-4.5"),

//   prompt: "Write a detailed 2 paragraph story about self confident",
// });

// // Stream output
// for await (const textPart of textStream) {
//   process.stdout.write(textPart);
// }
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// case-2
// tool (mannual) - fake agent

// import { streamText } from "ai";
// import { createOpenAI } from "@ai-sdk/openai";
// import dotenv from "dotenv";

// dotenv.config({ quiet: true });

// const openrouter = createOpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: process.env.OPENROUTER_API_KEY,
//   headers: {
//     "HTTP-Referer": "http://localhost:3000",
//     "X-Title": "Simple App",
//   },
// });

// // Manual "tool"
// const thoughts = [
//   "Small steps today lead to big results tomorrow.",
//   "Stay calm—confidence improves performance.",
//   "You're prepared more than you think.",
//   "Focus on effort, not fear.",
// ];

// const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];

// const { textStream } = await streamText({
//   model: openrouter("anthropic/claude-opus-4.5"),
//   prompt: `Use this motivational thought and expand on it: "${randomThought}"`,
// });

// for await (const textPart of textStream) {
//   process.stdout.write(textPart);
// }
////////////////////////////////////////////////////////////
// with tool-case3

import { streamText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import dotenv from "dotenv";
import z from "zod";

dotenv.config({ quiet: true });

// ✅ OpenRouter client
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  // headers: {
  //   "HTTP-Referer": "http://localhost:3000",
  //   "X-Title": "Simple App",
  // },
});

// ✅ System Prompt (NO tool info)
const systemPrompt = `
You are a helpful and concise AI assistant.
Give clear, short, and meaningful responses.
Do not over-explain.
Be direct and useful.
`;

// ✅ REAL TOOL
const getThoughtOfDay = tool({
  description: "Use this tool when user asks for a motivational thought",
  parameters: z.object({}),
  execute: async () => {
    console.log("✅ TOOL EXECUTED");

    console.log("✅ TOOL EXECUTED");

    const thoughts = [
      "Small steps today lead to big results tomorrow.",
      "Stay calm—confidence improves performance.",
      "You're prepared more than you think.",
      "Focus on effort, not fear.",
    ];

    // return thoughts[Math.floor(Math.random() * thoughts.length)];
    return {
      thought: thoughts[Math.floor(Math.random() * thoughts.length)],
    };
  },
});

// 🤖 Agent function
export const runAgent = async (input) => {
  try {
    const { fullStream } = await streamText({
      model: openrouter("anthropic/claude-opus-4.5"),

      system: systemPrompt, //instructuction
      prompt: input,

      tools: {
        getThoughtOfDay, //tool created
      },

      // 🔥 force tool usage
      toolChoice: "required",
    });

    console.log("\n🤖 Agent:\n");

    for await (const event of fullStream) {
      if (event.type === "tool-call") {
        console.log("\n🔧 TOOL CALLED:", event.toolName);
      }

      if (event.type === "tool-result") {
        console.log("📦 TOOL RESULT:", event.result || event.output);
      }

      if (event.type === "text-delta") {
        process.stdout.write(event.textDelta);
      }
    }
  } catch (err) {
    console.error("❌ ERROR:", err?.message || err);
    console.error("DETAILS:", err?.response?.data);
  }
};

// ▶️ Main function
const main = async () => {
  const query = "Give me today's motivational thought";

  console.log("🚀 Running Agent...\n");

  await runAgent(query);
};

main();
