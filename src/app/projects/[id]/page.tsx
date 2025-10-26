"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProjectChat from "../../../components/ProjectChat";
import TestCopilotRequest from "../../../components/TestCopilotRequest";
import { useCopilotChat } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui"

type Project = {
    id: string;
    title: string;
    components: any[];
    outputs: any[];
};

export default function ProjectPageClient() {
    const { id } = useParams() as { id?: string };
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Store latest assistant response
    const [agentResponse, setAgentResponse] = useState<string | null>(null);

    // Copilot chat hook (listens to messages)
    const copilotChat = useCopilotChat();

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        fetch(`/api/projects/${id}`)
            .then(async (res) => {
                if (res.status === 404) throw new Error("not found");
                if (!res.ok) throw new Error(`failed (${res.status})`);
                const body = await res.json();
                setProject(body);
            })
            .catch((err) => setError(String(err.message ?? err)))
            .finally(() => setLoading(false));
    }, [id]);

    // Listen to copilot/chat messages and extract the latest assistant message.
    useEffect(() => {
        if (!copilotChat) return;

        const extractLatestAssistant = (messages: any[]) => {
            if (!Array.isArray(messages) || messages.length === 0) return;
            // Find latest message where role indicates assistant/agent
            const latest = [...messages].reverse().find((m: any) => {
                const role = m.role ?? m.sender ?? m.from;
                return role === 'assistant' || role === 'agent';
            });
            if (latest) {
                // message content may be in different fields
                const text = latest.content ?? latest.text ?? latest.message ?? JSON.stringify(latest);
                setAgentResponse(String(text));
            }
        };

        // If the hook exposes an array of messages, initialize from it
        try {
            const msgs = (copilotChat as any).messages ?? (copilotChat as any).getMessages?.() ?? null;
            if (Array.isArray(msgs)) extractLatestAssistant(msgs as any[]);
        } catch (e) {
            // ignore initialization errors
        }

        // Subscribe to updates if the hook exposes a subscribe/onMessage API
        let unsub: (() => void) | undefined;
        if (typeof (copilotChat as any).subscribe === 'function') {
            unsub = (copilotChat as any).subscribe((messages: any[]) => extractLatestAssistant(messages));
        } else if (typeof (copilotChat as any).onMessage === 'function') {
            const handler = (msg: any) => {
                // try to handle both single message and array
                const arr = Array.isArray(msg) ? msg : [(copilotChat as any).messages?.slice?.(-1)[0] ?? msg];
                extractLatestAssistant(arr as any[]);
            };
            (copilotChat as any).onMessage(handler);
            unsub = () => (copilotChat as any).offMessage?.(handler);
        }

        return () => unsub?.();
    }, [copilotChat]);

    if (!id) return <div className="p-8">Project id missing</div>;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-900 text-slate-100 p-8">

            {/* CopilotSidebar removed per request - page displays only latest agent response */}

            <CopilotSidebar
                clickOutsideToClose={false}
                defaultOpen={true}
                labels={{
                    title: "Popup Assistant",
                    initial: "👋 Hi, there! You're chatting with an agent. This agent comes with a few tools to get you started.\n\nFor example you can try:\n- **Frontend Tools**: \"Set the theme to orange\"\n- **Shared State**: \"Write a proverb about AI\"\n- **Generative UI**: \"Get the weather in SF\"\n\nAs you interact with the agent, you'll see the UI update in real-time to reflect the agent's **state**, **tool calls**, and **progress**."
                }}
            />

            <div className="max-w-4xl mx-auto">
                {loading ? (
                    <div className="p-6 bg-white/5 rounded">Loading project...</div>
                ) : error ? (
                    <div className="p-6 bg-rose-600/10 rounded">Error: {error}</div>
                ) : project ? (
                    <>
                        <header className="mb-6">
                            <h1 className="text-3xl font-bold">{project.title}</h1>
                            <p className="text-slate-300">Chat with the IoT agent for this project.</p>
                        </header>

                        <section className="mb-6">
                            <div className="bg-white/5 p-4 rounded-md">
                                <h3 className="font-semibold">Project details</h3>
                                <p className="text-slate-300 mt-2">Components: {project.components?.length ?? 0}</p>
                                <p className="text-slate-300 mt-1">Outputs: {project.outputs?.length ?? 0}</p>
                            </div>
                        </section>

                        <section className="mb-6">
                            <div className="bg-white/10 p-4 rounded-md">
                                <h3 className="font-semibold mb-2">Response from IoT Agent</h3>
                                <div className="rounded-md bg-white/5 p-3 text-slate-200">
                                    {agentResponse ? agentResponse : <span className="text-slate-400">Waiting for response...</span>}
                                </div>
                            </div>
                        </section>

                        <section>
                            <ProjectChat project={{ id: project.id, title: project.title }} />
                            <TestCopilotRequest />
                        </section>
                    </>
                ) : (
                    <div className="p-6 bg-white/5 rounded">Project not found</div>
                )}
            </div>
        </main>
    );
}
