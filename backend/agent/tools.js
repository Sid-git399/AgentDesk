import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOTES_PATH = path.join(__dirname, "..", "data", "notes.json");

function readNotes() {
  try {
    const raw = fs.readFileSync(NOTES_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeNotes(notes) {
  fs.writeFileSync(NOTES_PATH, JSON.stringify(notes, null, 2));
}

// ---- Tool 1: Calculator ----
function calculator({ expression }) {
  // Only allow safe math characters to avoid arbitrary code execution
  if (!/^[0-9+\-*/().\s%^]+$/.test(expression)) {
    return { error: "Expression contains disallowed characters." };
  }
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expression.replace(/\^/g, "**")})`)();
    return { result };
  } catch (err) {
    return { error: `Could not evaluate expression: ${err.message}` };
  }
}

// ---- Tool 2: Clock ----
function getCurrentTime() {
  const now = new Date();
  return {
    iso: now.toISOString(),
    readable: now.toUTCString(),
  };
}

// ---- Tool 3: Notes ----
function manageNotes({ action, text, id }) {
  const notes = readNotes();

  if (action === "add") {
    const newNote = { id: Date.now(), text, done: false };
    notes.push(newNote);
    writeNotes(notes);
    return { added: newNote, allNotes: notes };
  }

  if (action === "list") {
    return { notes };
  }

  if (action === "delete") {
    const filtered = notes.filter((n) => n.id !== id);
    writeNotes(filtered);
    return { deleted: id, allNotes: filtered };
  }

  return { error: `Unknown action: ${action}` };
}

// Tool schema definitions sent to Claude
export const toolDefinitions = [
  {
    name: "calculator",
    description: "Evaluate a basic math expression (supports + - * / % ^ and parentheses).",
    input_schema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "The math expression to evaluate, e.g. '(4 + 5) * 2'",
        },
      },
      required: ["expression"],
    },
  },
  {
    name: "get_current_time",
    description: "Get the current date and time in UTC.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "manage_notes",
    description:
      "Add, list, or delete notes/todos for the user. Notes persist between conversations.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["add", "list", "delete"],
          description: "Which operation to perform.",
        },
        text: {
          type: "string",
          description: "The note text. Required when action is 'add'.",
        },
        id: {
          type: "number",
          description: "The note id to delete. Required when action is 'delete'.",
        },
      },
      required: ["action"],
    },
  },
];

// Dispatches a tool call by name and returns its result
export function executeTool(name, input) {
  switch (name) {
    case "calculator":
      return calculator(input);
    case "get_current_time":
      return getCurrentTime();
    case "manage_notes":
      return manageNotes(input);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
