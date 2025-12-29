"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IotProject,
} from "@/lib/types/iot-project";
import ProjectIdeaCard from "@/components/ProjectIdeaCard";
import ComponentCard from "@/components/ComponentCard";
import ChatIconButton from "@/components/ChatIconButton";
import CircuitDiagram from "@/components/CircuitDiagram";
import { calculateTotalCost } from "@/lib/component-utils";
import { ArrowLeft, Code2, Sparkles, MessageSquare, X, Box, Network } from "lucide-react";

export default function Page() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: React.ReactNode }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [project, setProject] = useState<IotProject | null>(null);
  const [code, setCode] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const router = useRouter();

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load project from sessionStorage if coming from home page
  useEffect(() => {
    const pendingProject = sessionStorage.getItem('pendingProject');
    if (pendingProject) {
      setProject(JSON.parse(pendingProject));
      sessionStorage.removeItem('pendingProject');
      setShowChat(true); // Auto-open chat
    }
  }, []);

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending user input
  const handleSend = async () => {
    if (!input.trim()) return;

    // Capture input value before clearing to prevent race condition
    const userInput = input.trim();
    const userMessage = { role: "user" as const, content: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/project_planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await res.json();
      console.log("Project Planner Response:", data);

      if (data.msg === false && data.project) {
        // store project in page state but do NOT add project details to chat
        setProject(data.project);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: <p>{data.message || "I couldn't create the project."}</p>,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: (
            <p className="text-red-400">
              Error: {(error as Error).message}
            </p>
          ),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Generate ESP32 code
  const generateCode = async () => {
    if (!project) return alert("Please generate a valid project first.");

    setCodeLoading(true);
    setCode("");
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Generating ESP32 code... ⚙️" },
    ]);

    try {
      const res = await fetch("/api/code_generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });

      const data = await res.json();
      console.log("ESP32 Code Response:", data);

      if (data.msg === false && data.code) {
        // save generated code to state but do NOT add code details to chat
        setCode(data.code);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: <p>{data.message || "Failed to generate code."}</p>,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: (
            <p className="text-red-400">
              Error generating code: {(error as Error).message}
            </p>
          ),
        },
      ]);
    } finally {
      setCodeLoading(false);
    }
  };

  // Create project
  const create_project = async () => {
    if (!project || !code.trim()) return alert("Project or code missing!");



    const projectWithCode: IotProject = { ...project, code };

    try {
      const res = await fetch("/api/create_project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: projectWithCode }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Failed to create project:", errText);
        setSuccessMessage("❌ Failed to create project.");
        return;
      }

      const result = await res.json();
      console.log("✅ Project created successfully:", result);
      setSuccessMessage("✅ Project created successfully!");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: (
            <p className="text-green-400 font-semibold">
              ✅ Project created successfully! Redirecting to your projects...
            </p>
          ),
        },
      ]);

      // Redirect to home page after a short delay to show success message
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error("Error creating project:", (error as Error).message);
      setSuccessMessage("❌ Error creating project: " + (error as Error).message);
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-white flex">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${showChat ? 'mr-[420px]' : 'mr-0'}`}>
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group mb-6"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Projects</span>
            </button>

            <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              ESP32 Project Generator
            </h1>
            <p className="text-gray-400 text-lg">
              Describe your IoT idea to automatically generate ESP32 projects and firmware.
            </p>
          </div>

          {/* Project Panel */}
          {project && (
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Project Idea</h2>
              </div>

              <div className="mb-6">
                <ProjectIdeaCard project={project} />
              </div>

              {/* Components Required Section */}
              {project.components && project.components.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Box className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Components Required</h3>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="text-sm text-gray-400">Estimated Cost</div>
                      <div className="text-lg font-bold text-green-400">
                        {(() => {
                          const totalCost = calculateTotalCost(project.components);
                          return `$${totalCost.min}-${totalCost.max}`;
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {project.components.map((comp, idx) => (
                      <ComponentCard key={idx} component={comp} />
                    ))}
                  </div>
                </div>
              )}

              {/* Circuit Diagram Section */}
              {project.components && project.components.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                      <Network className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Circuit Diagram</h3>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border border-white/10">
                    <CircuitDiagram components={project.components} />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={generateCode}
                  disabled={codeLoading}
                  className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <Code2 className="w-5 h-5" />
                  {codeLoading ? "Generating..." : "Generate ESP32 Code"}
                </button>

                {code && (
                  <button
                    onClick={create_project}
                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-green-500/30 transition-all hover:scale-105"
                  >
                    ✅ Create Project
                  </button>
                )}
              </div>

              {code && (
                <div className="rounded-xl bg-slate-900/80 border border-violet-500/30 p-6 overflow-x-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-violet-400" />
                      <h3 className="text-lg font-semibold text-white">Generated Code</h3>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(code)}
                      className="px-3 py-1 text-sm rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {code}
                  </pre>
                </div>
              )}

              {successMessage && (
                <div className={`mt-4 px-4 py-3 rounded-lg ${successMessage.includes('✅')
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
                  }`}>
                  {successMessage}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!project && (
            <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Project Yet</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Open the Project Assistant chat to start planning your IoT project with AI guidance.
              </p>
              <button
                onClick={() => setShowChat(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-fuchsia-500/30 transition-all hover:scale-105"
              >
                <MessageSquare className="w-5 h-5" />
                Open Assistant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Icon - Only show when chat is closed */}
      {!showChat && <ChatIconButton onClick={() => setShowChat(true)} />}

      {/* Side Panel Chat */}
      {showChat && (
        <div className="fixed top-0 right-0 h-screen w-[420px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col animate-slide-in-right">
          {/* Chat Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    Project Assistant
                  </h2>
                  <p className="text-xs text-gray-400">AI-powered IoT planner</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-600/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-gray-400 text-sm">
                  Tell me about your IoT project idea and I'll help you plan it!
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[85%] ${msg.role === "user"
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                    : "bg-white/10 text-gray-200 backdrop-blur-sm"
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                  <p className="text-gray-400 italic text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
                    Thinking about your project...
                  </p>
                </div>
              </div>
            )}

            {codeLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                  <p className="text-gray-400 italic text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    Generating ESP32 code...
                  </p>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-white/10 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Describe your IoT idea..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border border-white/20 bg-slate-800/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-500"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl px-5 py-3 hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
