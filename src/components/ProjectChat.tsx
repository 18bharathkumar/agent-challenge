"use client";

import React, { useEffect, useState } from "react";
import { useCopilotChat, useCopilotContext } from "@copilotkit/react-core";

type Props = { project: { id: string; title: string } };

function randomId() {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function ProjectChat({ project }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [assistant, setAssistant] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copilot = useCopilotChat();
  const copilotContext = useCopilotContext();
  const [copilotReady, setCopilotReady] = useState(false);

  // Detect when copilot.sendMessage becomes available and mark ready
  useEffect(() => {
    let mounted = true;
    const checkReady = async () => {
      const start = Date.now();
      while (mounted && Date.now() - start < 10000) {
        if (copilot && typeof (copilot as any).sendMessage === "function") {
          setCopilotReady(true);
          return;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 150));
      }
      // if not ready after timeout we still leave copilotReady false
    };
    checkReady();
    return () => {
      mounted = false;
    };
  }, [copilot]);

  // Sync full message list from Copilot hook and extract assistant/latest
  useEffect(() => {
    try {
      const msgs = (copilot as any)?.messages ?? [];
      if (!Array.isArray(msgs)) return setMessages([]);
      // Normalize messages to a consistent shape
      const normalized = msgs.map((m: any) => {
        const id = m.id ?? m.messageId ?? randomId();
        const role = m.role ?? m.sender ?? m.from ?? (m.name ? "assistant" : "user");
        const content = m.content ?? m.text ?? m.message ?? m.body ?? m.output ?? null;
        return { id, role, content, raw: m };
      });
      setMessages(normalized);

      const latestAssistant = [...normalized].reverse().find((m) => m.role === "assistant" || m.role === "agent");
      if (latestAssistant) setAssistant(String(latestAssistant.content ?? JSON.stringify(latestAssistant.raw)));
    } catch (e) {
      // ignore
    }
  }, [copilot]);

  // If a prompt was queued while Copilot was initializing, send it once ready
  useEffect(() => {
    if (!copilotReady || !pendingPrompt) return;
    (async () => {
      try {
        if (copilot && typeof (copilot as any).sendMessage === "function") {
          await (copilot as any).sendMessage({ id: randomId(), role: "user", content: pendingPrompt });
          setPendingPrompt(null);
        }
      } catch (e: any) {
        setError(String(e?.message ?? e));
      }
    })();
  }, [copilotReady, pendingPrompt, copilot]);

  // Keep chatId in sync with Copilot context (thread/run id)
  useEffect(() => {
    const maybeId = (copilotContext as any)?.runId ?? (copilotContext as any)?.threadId ?? null;
    if (maybeId) setChatId(String(maybeId));
  }, [copilotContext]);

  async function sendPrompt() {
    if (!input.trim()) return;
    // If copilot hasn't attached its headless sendMessage yet, queue the prompt
    if (!copilotReady) {
      setPendingPrompt(input.trim());
      setAssistant((prev) => prev ?? null);
      setInput("");
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!copilot || typeof (copilot as any).sendMessage !== "function") {
        throw new Error("Copilot chat is not initialized");
      }

      // send a user message via the copilot chat hook
      await (copilot as any).sendMessage({ id: randomId(), role: "user", content: input.trim() });

      // messages are observed by the effect above; ensure we read the thread/run id
      const maybeId = (copilotContext as any)?.runId ?? (copilotContext as any)?.threadId ?? null;
      if (maybeId) setChatId(String(maybeId));

      setInput("");
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  // Small util: try to parse assistant text as JSON and return object or null
  function tryParseJson(text: string | null) {
    if (!text) return null;
    try {
      // Some assistants wrap JSON in markdown/code fences; strip them
      const cleaned = String(text).trim().replace(/^```(?:json)?\n/, "").replace(/\n```$/, "");
      return JSON.parse(cleaned);
    } catch (e) {
      return null;
    }
  }

  const parsedJson = tryParseJson(assistant);

  function exportConversation() {
    try {
      const conv = messages.map((m) => ({ id: m.id, role: m.role, content: m.content }));
      const text = JSON.stringify({ chatId, conversation: conv }, null, 2);
      navigator.clipboard?.writeText(text);
      setError("Conversation JSON copied to clipboard");
      setTimeout(() => setError(null), 1500);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/5 rounded-xl p-4 shadow-md flex flex-col">
      <div className="mb-3">
        <h4 className="text-lg font-semibold">{project.title}</h4>
        <p className="text-sm text-slate-400">Send a prompt to the IoT agent and receive the latest response.</p>
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Turn on greenhouse lights at 7pm"
          className="flex-1 rounded-md p-3 bg-white/5 focus:outline-none"
        />
        <button
          onClick={sendPrompt}
          disabled={loading || !copilotReady}
          className={`px-4 py-2 rounded-md ${copilotReady ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-600 cursor-not-allowed"}`}>
          {loading ? "Sending..." : copilotReady ? "Send" : "Initializing..."}
        </button>
      </div>

      <div className="mb-3">
        <h5 className="font-medium">Chat ID</h5>
        <div className="rounded-md bg-white/5 p-2 text-sm">{chatId ?? "(none yet)"}</div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium">Conversation</h5>
          <div className="flex items-center gap-2">
            <button onClick={exportConversation} className="text-xs px-2 py-1 bg-slate-700 rounded hover:bg-slate-600">Export JSON</button>
          </div>
        </div>

        <div className="mt-2 rounded-md bg-white/5 p-3 max-h-72 overflow-auto space-y-2">
          {messages.length === 0 ? (
            <div className="text-slate-400">No messages yet.</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`p-2 rounded ${m.role === "assistant" || m.role === "agent" ? "bg-slate-800" : "bg-slate-700/30"}`}>
                <div className="text-xs text-slate-300">{m.role}</div>
                <div className="mt-1 text-sm text-slate-100">
                  {tryParseJson(String(m.content)) ? (
                    <pre className="text-sm overflow-auto bg-black/10 p-2 rounded">{JSON.stringify(tryParseJson(String(m.content)), null, 2)}</pre>
                  ) : (
                    <div className="whitespace-pre-wrap">{String(m.content)}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
