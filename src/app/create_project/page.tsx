"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  IotProject,
} from "@/lib/types/iot-project";
import ProjectIdeaCard from "@/components/ProjectIdeaCard";
import ChatIconButton from "@/components/ChatIconButton";

export default function Page() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: React.ReactNode }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [project, setProject] = useState<IotProject | null>(null);
  const [code, setCode] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending user input
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/project_planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
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
            <p className="text-red-600">
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
            <p className="text-red-600">
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
            <p className="text-green-700 font-semibold">
              ✅ Project created successfully!
            </p>
          ),
        },
      ]);
    } catch (error) {
      console.error("Error creating project:", (error as Error).message);
      setSuccessMessage("❌ Error creating project: " + (error as Error).message);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900 p-8">
      <h1 className="text-3xl font-bold text-center text-blue-600">
        ESP32 Project Generator
      </h1>
      <p className="text-center text-gray-500 mt-2">
        Describe your IoT idea to automatically generate ESP32 projects and firmware.
      </p>

      {/* External project / code panel (renders outside the chat) */}
      {project && (
        <div className="mt-6 max-w-3xl mx-auto p-4 bg-white rounded-xl shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Project Idea</h2>
          <div className="mt-3">
            <ProjectIdeaCard project={project} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={generateCode}
              disabled={codeLoading}
              className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              ⚡ Generate ESP32 Code
            </button>

            {code && (
              <button
                onClick={create_project}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✅ Create Project
              </button>
            )}
          </div>

          {code && (
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl shadow border border-violet-200 p-4 overflow-x-auto text-xs mt-4">
              <pre className="bg-transparent text-violet-900 whitespace-pre-wrap">{code}</pre>
            </div>
          )}

          {successMessage && (
            <p className="mt-2 text-green-700 font-semibold">{successMessage}</p>
          )}
        </div>
      )}

      {/* Floating Chat Icon */}
      <ChatIconButton onClick={() => setShowChat(true)} />

      {/* Chat Popup */}
      {showChat && (
        <div className="fixed bottom-24 right-8 w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-200 p-5 z-50 animate-fade-in flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-blue-600">
              💬 Project Assistant
            </h2>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-gray-50 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-gray-500 italic text-sm">
                Thinking about your project...
              </p>
            )}
            {codeLoading && (
              <p className="text-gray-500 italic text-sm">
                Generating ESP32 code...
              </p>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your IoT idea..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
