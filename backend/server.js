import "dotenv/config";
import express from "express";
import cors from "cors";
import { runAgent } from "./agent/agent.js";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory conversation store, keyed by a session id from the frontend.
// (Simple approach for a portfolio project — swap for a DB for production.)
const sessions = new Map();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { sessionId = "default", message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "'message' (string) is required." });
    }

    const history = sessions.get(sessionId) || [];
    const updatedConversation = [...history, { role: "user", content: message }];

    const { reply, conversation } = await runAgent(updatedConversation);

    sessions.set(sessionId, conversation);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AgentDesk backend running on http://localhost:${PORT}`);
});
