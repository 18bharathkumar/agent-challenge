"use client";
import React, { useState, useEffect } from "react";
import { Cpu, Code2, Zap, Waves } from "lucide-react";

export default function LandingHeader() {
  const [particles, setParticles] = useState<Array<{ left: string; top: string; delay: string; duration: string }>>([]);

  // Generate particles only on client side to avoid hydration mismatch
  useEffect(() => {
    const generatedParticles = [...Array(8)].map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${i * 2.5}s`,
      duration: `${15 + Math.random() * 10}s`,
    }));
    setParticles(generatedParticles);
  }, []);

  const agents = [
    {
      icon: Cpu,
      title: "IoT Planner",
      description: "Intelligently orchestrates IoT device workflows and automation sequences",
      gradient: "from-violet-500 to-purple-600",
      glowColor: "shadow-violet-500/50",
    },
    {
      icon: Code2,
      title: "Code Generator",
      description: "Automatically generates optimized code for ESP32 and IoT devices",
      gradient: "from-cyan-500 to-blue-600",
      glowColor: "shadow-cyan-500/50",
    },
    {
      icon: Zap,
      title: "Triggering Agent",
      description: "Executes real-time MQTT commands and manages device responses",
      gradient: "from-fuchsia-500 to-pink-600",
      glowColor: "shadow-fuchsia-500/50",
    },
  ];

  return (
    <header className="relative w-full overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900 text-white">
      {/* Animated background mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero content */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Waves className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-100">AI-Powered IoT Automation</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-fuchsia-200 bg-clip-text text-transparent animate-gradient">
              AI-Orchestrated IoT
            </span>
            <br />
            <span className="text-white">Automation System</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed">
            Harness the power of three intelligent agents working in harmony to plan, generate,
            and execute seamless IoT automations for your ESP32 devices
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full font-semibold text-white shadow-lg hover:shadow-2xl hover:shadow-fuchsia-500/50 transition-all duration-300 hover:scale-105">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button className="px-8 py-4 rounded-full font-semibold text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {agents.map((agent, index) => (
            <div
              key={agent.title}
              className="group relative glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${agent.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${agent.gradient} shadow-lg ${agent.glowColor} mb-4 group-hover:animate-float`}>
                  <agent.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-cyan-200 transition-all duration-300">
                  {agent.title}
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {agent.description}
                </p>

                {/* Decorative line */}
                <div className={`mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r ${agent.gradient} rounded-full transition-all duration-500`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
