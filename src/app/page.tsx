"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import LandingHeader from "@/components/LandingHeader";
import ProjectCardLanding from "@/components/ProjectCardLanding";
import { Plus, Sparkles, X } from "lucide-react";
import { IotProject } from "@/lib/types/iot-project";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: React.ReactNode }[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [project, setProject] = useState<IotProject | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
      setLoading(false);
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Capture input value before clearing to prevent race condition
    const userInput = input.trim();
    const userMessage = { role: "user" as const, content: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/project_planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await res.json();

      if (data.msg === false && data.project) {
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
          content: <p className="text-red-600">Error: {(error as Error).message}</p>,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects?id=${projectId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        // Refresh projects list
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        alert("Failed to delete project: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error deleting project: " + (error as Error).message);
    }
  };


  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <LandingHeader />

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Your Projects
            </h2>
            <p className="text-gray-400 text-lg">Manage and monitor your IoT automation projects</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-fuchsia-500/30 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg mb-4 animate-shimmer" />
                <div className="h-4 bg-slate-700 rounded w-2/3 mb-3" />
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-700 rounded-full w-24" />
                  <div className="h-6 bg-slate-700 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-slide-up">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center animate-glow-pulse">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">No Projects Yet</h3>
            <p className="text-gray-400 text-center max-w-md mb-8">
              Start your IoT automation journey by creating your first project.
              Let our AI agents help you build something amazing!
            </p>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-fuchsia-500/30 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {projects.map((proj, index) => (
              <div key={proj.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <ProjectCardLanding
                  project={proj}
                  onClick={() => router.push(`/${proj.id}`)}
                  onDelete={handleDeleteProject}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white">💬 Project Assistant</h2>
                <p className="text-sm text-gray-400 mt-1">Describe your IoT idea and let AI do the magic</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setMessages([]);
                  setProject(null);
                  setInput("");
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 && !project && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Let's create something amazing!</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Tell me about your IoT project idea, or try one of these templates:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    <button
                      onClick={() => setInput("Create a smart home automation system with temperature sensor and LED control")}
                      className="text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1 group-hover:text-violet-300 transition-colors">Smart Home</h4>
                          <p className="text-xs text-gray-400">Temperature & LED control</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setInput("Build a security system with motion sensor and alarm notification")}
                      className="text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1 group-hover:text-cyan-300 transition-colors">Security System</h4>
                          <p className="text-xs text-gray-400">Motion sensor & alerts</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setInput("Design an automated garden watering system with soil moisture detection")}
                      className="text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1 group-hover:text-green-300 transition-colors">Garden Automation</h4>
                          <p className="text-xs text-gray-400">Smart watering system</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setInput("Create an energy monitoring system to track power consumption")}
                      className="text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-fuchsia-500/50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1 group-hover:text-fuchsia-300 transition-colors">Energy Monitor</h4>
                          <p className="text-xs text-gray-400">Track power usage</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                        : "bg-white/10 text-gray-200"
                        }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && <p className="text-gray-500 italic text-sm">Thinking about your project...</p>}
                <div ref={chatEndRef} />
              </div>

              {project && (
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Project planning done!</h3>
                    <p className="text-gray-400 text-sm mb-4">Your IoT project is ready to review and generate code</p>
                  </div>

                  <button
                    onClick={() => {
                      sessionStorage.setItem('pendingProject', JSON.stringify(project));
                      setShowCreateModal(false);
                      router.push('/create_project');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all"
                  >
                    View Project Details
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your IoT idea... or pick a template above"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 border border-white/20 bg-slate-900/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-500"
                />
                <button
                  onClick={handleSend}
                  disabled={chatLoading}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all disabled:opacity-50"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
