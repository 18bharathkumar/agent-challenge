"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingHeader from "@/components/LandingHeader";
import ProjectCardLanding from "@/components/ProjectCardLanding";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-900 text-slate-100 flex flex-col items-center">
      <LandingHeader />
      <section className="w-full max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-sky-300 mb-8 text-center animate-slide-in">Your Projects</h2>
        <div className="flex justify-end mb-8">
          <button
            onClick={() => router.push("/create_project")}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-2 rounded-full shadow transition-transform hover:scale-105"
          >
            + Create Project
          </button>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-slate-700 mb-4" />
            <div className="h-4 w-48 bg-slate-700 rounded mb-2" />
            <div className="h-4 w-32 bg-sky-500 rounded" />
            <div className="mt-4 text-slate-300 text-lg">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white/10 p-8 rounded-xl text-center text-slate-300 shadow-md">No projects yet. Create your first project to get started!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj) => (
              <ProjectCardLanding key={proj.id} project={proj} onClick={() => router.push(`/${proj.id}`)} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
