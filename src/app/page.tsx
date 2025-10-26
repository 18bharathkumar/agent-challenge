"use client";

import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import CreateProjectForm from "../components/CreateProjectForm";

type Project = {
  id: string;
  title: string;
  components: any[];
  outputs: any[];
};

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // no inline chat; navigation opens project page

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      setError(String(err.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  function onCreated(p: Project) {
    setProjects((s) => [p, ...s]);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold">IoT Projects</h1>
            <p className="text-slate-300 mt-1">Manage your IoT projects — view, create, and chat with your IoT agent.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm"
              onClick={() => fetchProjects()}
            >
              Refresh
            </button>
            <button
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-md text-sm shadow"
              onClick={() => {
                const el = document.getElementById("create-project");
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              + Create Project
            </button>
          </div>
        </header>

        <section id="create-project" className="mb-8">
          <CreateProjectForm onCreated={onCreated} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Projects</h2>
          {loading ? (
            <div className="text-slate-300">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="bg-white/5 p-6 rounded-md">No projects yet — create one above.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
            </div>
          )}
        </section>
        
      </div>
    </main>
  );
}



