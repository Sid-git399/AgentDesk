import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, executeTool } from "./tools.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are AgentDesk, a helpful AI agent with access to tools:
a calculator, a clock, and a persistent notes/todo list.

Use tools whenever they would give a more accurate or useful answer than guessing
(e.g. any arithmetic, any request involving the current date/time, or anything about
notes/todos). Once you have everything you need, reply to the user in plain, friendly
text. Do not mention the tool names to the user; just use their results naturally.`;

/**
 * Runs the agentic loop: sends messages to Claude, executes any requested tools,
 * feeds results back, and repeats until Claude produces a final text answer.
 *
 * @param {Array<{role: 'user'|'assistant', content: any}>} conversation
 * @returns {Promise<{reply: string, conversation: Array}>}
 */
export async function runAgent(conversation) {
  let messages = [...conversation];
  const MAX_TURNS = 6; // safety cap to avoid infinite tool loops

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions,
      messages,
    });

    // Add Claude's response to the running conversation
    messages.push({ role: "assistant", content: response.content });

    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");

    if (toolUseBlocks.length === 0) {
      // No tool calls -> this is the final answer
      const textBlock = response.content.find((b) => b.type === "text");
      return {
        reply: textBlock ? textBlock.text : "",
        conversation: messages,
      };
    }

    // Execute every requested tool and collect results
    const toolResults = toolUseBlocks.map((block) => {
      const result = executeTool(block.name, block.input);
      return {
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      };
    });

    messages.push({ role: "user", content: toolResults });
  }

  return {
    reply: "Sorry, I got stuck in a loop trying to use my tools. Please try rephrasing your request.",
    conversation: messages,
  };
}
