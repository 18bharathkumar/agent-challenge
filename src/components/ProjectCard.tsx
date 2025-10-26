"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  components: any[];
  outputs: any[];
};

export default function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();

  return (
    <article className="bg-white/5 p-6 rounded-xl shadow-md hover:scale-[1.01] transition-transform">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <p className="text-sm text-slate-300 mt-2">Components: {project.components?.length ?? 0} • Outputs: {project.outputs?.length ?? 0}</p>
        </div>
        <div className="text-xs text-slate-400">{new Date().toLocaleDateString()}</div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => router.push(`/projects/${project.id}`)}
          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded text-sm"
        >
          Open Project
        </button>
        <button className="px-3 py-1 bg-white/5 rounded text-sm">Edit</button>
      </div>
    </article>
  );
}
