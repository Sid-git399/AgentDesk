# AgentDesk 🤖

A full-stack AI agent app. Unlike a plain chatbot, AgentDesk's agent can **use tools**:

- 🧮 Calculator — solves math expressions
- 🕒 Clock — tells the current date/time
- 📝 Notes — adds, lists, and deletes persistent notes/todos

It's built with an **agentic loop**: the backend sends your message to Claude along with
a list of available tools. If Claude decides it needs a tool, the backend runs it and
feeds the result back to Claude, looping until Claude has a final answer for the user.

## Stack

- **Backend**: Node.js, Express, Anthropic SDK
- **Frontend**: React + Vite

## Project structure

```
agentdesk/
├── backend/
│   ├── server.js              # Express app + /api/chat route
│   ├── agent/
│   │   ├── agent.js           # The agentic loop (calls Claude, runs tools, loops)
│   │   └── tools.js           # Tool definitions + tool execution logic
│   ├── data/
│   │   └── notes.json         # Simple file-based storage for the notes tool
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── App.css
│       ├── api/chat.js
│       └── components/
│           ├── ChatWindow.jsx
│           ├── MessageBubble.jsx
│           └── ChatInput.jsx
└── docs/
    └── COMMIT_PLAN.md         # Day-by-day plan for spreading this into real commits
```

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open the Vite dev URL (usually http://localhost:5173).

## How the agent loop works (high level)

1. User sends a message from the React UI.
2. Backend sends the full conversation + tool definitions to Claude.
3. If Claude's response contains a `tool_use` block, the backend executes that tool
   locally (calculator, clock, or notes) and sends the result back to Claude.
4. This repeats until Claude replies with plain text — that's the final answer, which
   gets sent back to the frontend.

See `docs/COMMIT_PLAN.md` for how to split this into daily GitHub commits.
