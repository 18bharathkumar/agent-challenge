"use client";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: any) => void;
    onend: () => void;
  }

  interface SpeechRecognitionEvent extends Event {
    results: {
      [index: number]: {
        [index: number]: {
          transcript: string;
          confidence: number;
        };
      };
    };
  }
}

import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, X } from "lucide-react";
import { Output, Trigger, Automation } from "@/lib/types/iot-project";
import OutputList from "@/components/OutputList";
import TriggerList from "@/components/TriggerList";
import AutomationList from "@/components/AutomationList";
import ChatIconButton from "@/components/ChatIconButton";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [outputValues, setOutputValues] = useState<Record<string, any>>({});
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // ✅ Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setTimeout(() => document.getElementById("send-btn")?.click(), 400);
        };
        recognition.onerror = () => setListening(false);
        recognition.onend = () => setListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // ✅ Fetch project + MQTT setup
  useEffect(() => {
    let mqttClient: mqtt.MqttClient | null = null;

    async function fetchProject() {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/projects`, {
          cache: "no-store",
        });
        const data = await res.json();
        const proj = data.projects?.find((p: any) => p.id === id);

        console.log("Parsed Project Data:", proj);
        setProject(proj);
        setLoading(false);

        // Setup MQTT client if project outputs exist
        if (proj && proj.outputs?.length > 0) {
          const brokerUrl = process.env.NEXT_PUBLIC_MQTT_URL || "ws://localhost:9001";

          try {
            mqttClient = mqtt.connect(brokerUrl, {
              reconnectPeriod: 0, // Disable auto-reconnect
              connectTimeout: 5000, // 5 second timeout
            });

            mqttClient.on('connect', () => {
              console.log('Connected to MQTT broker');
              proj.outputs.forEach((out: Output) => {
                //@ts-ignore
                mqttClient?.subscribe(out.publish_topic);
                //@ts-ignore
                console.log("Subscribed to:", out.publish_topic);
              });
            });

            mqttClient.on('message', (topic, message) => {
              setOutputValues((prev) => ({ ...prev, [topic]: message.toString() }));
            });

            mqttClient.on('error', (err) => {
              console.log('MQTT Error (non-critical):', err.message);
              mqttClient?.end();
            });

          } catch (mqttError) {
            console.log('MQTT Connection Error (non-critical):', mqttError);
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setLoading(false);
      }
    }

    fetchProject();

    // Cleanup function
    return () => {
      if (mqttClient) {
        console.log('Closing MQTT connection');
        mqttClient.end();
      }
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading project...</p>
      </div>
    );
  }

  if (!project) return <div className="p-8 text-gray-700">Project not found</div>;

  // ✅ Voice Output (Speech synthesis)
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ✅ Handle message send
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/triggering_agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, triggers: project.triggers }),
      });

      const data = await res.json();
      const botReply = data.result || "No response from agent.";
      setMessages((prev) => [...prev, { role: "assistant", text: botReply }]);
      speak(botReply);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "⚠️ Error reaching agent." }]);
    }
  }

  // ✅ Start listening (voice input)
  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser. Use Chrome for best results.");
      return;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </a>

        {/* Project Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
            {project.title}
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl">{project.description}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 mb-12">
          <OutputList outputs={project.outputs} outputValues={outputValues} />
          <TriggerList triggers={project.triggers} />
        </div>

        {/* Automations - Full Width */}
        <div className="mb-12">
          <AutomationList automations={project.automations} />
        </div>

        {/* ✅ Chat Window */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-24 right-8 w-[360px] bg-slate-900 border border-white/20 rounded-3xl shadow-2xl p-6 z-50 backdrop-blur-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">💬 Project Agent</h2>
                <button onClick={() => setShowChat(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </button>
              </div>

              <div className="h-64 overflow-y-auto border border-white/10 rounded-lg p-4 mb-4 bg-slate-900/50">
                {messages.length === 0 && (
                  <p className="text-gray-500 text-center mt-16">
                    Start chatting or say something 🎤
                  </p>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl ${msg.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                        : "bg-white/10 text-gray-200"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={listening ? "Listening..." : "Type or speak..."}
                  className="flex-1 border border-white/20 bg-slate-900/50 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-500"
                />

                {/* 🎤 Voice Input Button */}
                <button
                  type="button"
                  onClick={startListening}
                  className={`p-3 rounded-full transition ${listening ? "bg-red-500 animate-pulse" : "bg-white/10 hover:bg-white/20"
                    }`}
                  title="Start voice input"
                >
                  <Mic className={`w-5 h-5 ${listening ? "text-white" : "text-gray-300"}`} />
                </button>

                {/* 🚀 Send Button */}
                <button
                  id="send-btn"
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-3 rounded-full hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Display Project Code Section */}
        {project.code && (
          <div className="glass-card rounded-2xl p-6 mb-8 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Project Code
              </h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(project.code);
                  const button = document.getElementById('copy-button');
                  if (button) {
                    const originalText = button.innerText;
                    button.innerText = 'Copied!';
                    setTimeout(() => {
                      button.innerText = originalText;
                    }, 2000);
                  }
                }}
                id="copy-button"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-lg hover:shadow-fuchsia-500/30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Code
              </button>
            </div>
            <pre className="text-sm whitespace-pre-wrap text-gray-300 bg-slate-900/50 rounded-lg p-4 border border-white/10">{project.code}</pre>
          </div>
        )}

        {/* Floating Chat Button */}
        <ChatIconButton onClick={() => setShowChat((v) => !v)} />
      </div>
    </div>
  );
}

// ✅ Custom Hook to unwrap async params in Next.js
function use(params: Promise<{ id: string }>): { id: any } {
  const [value, setValue] = useState<{ id: any } | null>(null);

  useEffect(() => {
    let mounted = true;
    params.then((result) => {
      if (mounted) setValue(result);
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  return value ?? { id: "" };
}
