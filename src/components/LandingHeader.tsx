import React from "react";

export default function LandingHeader() {
  return (
    <header className="w-full flex flex-col items-center justify-center py-16 bg-gradient-to-br from-sky-900 to-slate-900 text-slate-100">
      <h1 className="text-5xl md:text-6xl font-extrabold text-sky-400 tracking-tight drop-shadow-lg animate-bounce mb-4">
        Nosana Iot Automation with Agentic support 
      </h1>
      <p className="text-lg md:text-xl text-slate-200 max-w-2xl text-center animate-fade-in">
        Build, manage, and automate your IoT projects with AI-powered agents and a modern dashboard.
      </p>
      <div className="mt-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-pink-500 shadow-xl animate-spin-slow" />
      </div>
    </header>
  );
}
