"use client";

import React, { useState } from "react";

export default function TestCopilotRequest() {
  const [prompt, setPrompt] = useState("Please produce a JSON IoT project plan for a greenhouse lighting schedule (times, actions, outputs).");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      query: "mutation generateCopilotResponse($data: GenerateCopilotResponseInput!) { generateCopilotResponse(data: $data) { threadId runId messages { __typename ... on TextMessageOutput { id role content } ... on ResultMessageOutput { id result actionName } ... on AgentStateMessageOutput { id role state } } } }",
      variables: {
        data: {
          metadata: { requestType: "Chat" },
          frontend: { actions: [] },
          messages: [
            {
              id: `m-${Date.now()}`,
              createdAt: new Date().toISOString(),
              textMessage: {
                role: "user",
                content: prompt,
              },
            },
          ],
        },
      },
    };

    try {
      const res = await fetch("/api/copilotkit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/graphql-response+json, application/json, text/event-stream, multipart/mixed",
          "x-copilotkit-runtime-client-gql-version": "1.10.6",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      // try parse JSON safely
      try {
        setResult(JSON.parse(text));
      } catch (e) {
        setResult(text);
      }
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 p-4 bg-white/5 rounded-md max-w-4xl mx-auto">
      <h3 className="font-semibold mb-2">Test CopilotKit request</h3>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        className="w-full p-2 bg-white/5 rounded mb-2"
      />
      <div className="flex gap-2">
        <button onClick={send} disabled={loading} className="px-3 py-1 bg-emerald-600 rounded">
          {loading ? "Sending..." : "Send to /api/copilotkit"}
        </button>
        <button
          onClick={() => {
            setPrompt("Please produce a JSON IoT project plan for a greenhouse lighting schedule (times, actions, outputs).");
          }}
          className="px-3 py-1 bg-slate-600 rounded"
        >
          Reset
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-medium">Response</h4>
        <div className="mt-2 p-2 bg-black/10 rounded min-h-[80px] overflow-auto">
          {error ? (
            <div className="text-rose-400">Error: {error}</div>
          ) : result ? (
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
          ) : (
            <div className="text-slate-400">No response yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
