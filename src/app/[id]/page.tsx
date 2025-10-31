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
  const [outputValues, setOutputValues] = useState<Record<string, any>>({});
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // ✅ Initialize speech recognition
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

  // ✅ Fetch project + MQTT
  useEffect(() => {
    async function fetchProject() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/projects`, {
        cache: "no-store",
      });
      const data = await res.json();
      const proj = data.projects?.find((p: any) => p.id === id);
      setProject(proj);
      if (proj && proj.outputs?.length > 0) {
        const client = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_URL || "ws://localhost:9001");
        proj.outputs.forEach((out: Output) => client.subscribe(out.mqtt_topic));
        client.on("message", (topic, message) => {
          setOutputValues((prev) => ({ ...prev, [topic]: message.toString() }));
        });
        return () => client.end();
      }
    }
    fetchProject();
  }, [id]);

  if (!project) return <div className="p-8 text-gray-700">Project not found</div>;

  // ✅ Voice Output (Assistant speech)
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ✅ Send Message
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: { role: "user" | "assistant"; text: string } = { role: "user", text: input };
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
      speak(botReply); // 🎤 Speak response
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "⚠️ Error reaching agent." }]);
    }
  }

  // ✅ Start listening
  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser. Use Chrome for best results.");
      return;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <a href="/" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to Projects
      </a>
      <h1 className="text-3xl font-bold text-blue-600 mb-6">{project.title}</h1>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-8">
        <OutputList outputs={project.outputs} outputValues={outputValues} />
        <TriggerList triggers={project.triggers} />
        <AutomationList automations={project.automations} />
      </div>

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-8 w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-600">💬 Project Agent</h2>
              <button onClick={() => setShowChat(false)}>
                <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
              {messages.length === 0 && (
                <p className="text-gray-400 text-center mt-16">Start chatting or say something 🎤</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl ${
                      msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
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
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* 🎤 Voice Button */}
              <button
                type="button"
                onClick={startListening}
                className={`p-3 rounded-full transition ${
                  listening ? "bg-red-500 animate-pulse" : "bg-gray-200 hover:bg-gray-300"
                }`}
                title="Start voice input"
              >
                <Mic className={`w-5 h-5 ${listening ? "text-white" : "text-gray-700"}`} />
              </button>

              <button
                id="send-btn"
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatIconButton onClick={() => setShowChat((v) => !v)} />
    </div>
  );
}
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

  // Return a fallback until resolved
  return value ?? { id: "" };
}

