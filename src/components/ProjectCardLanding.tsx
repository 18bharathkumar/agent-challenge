import React from "react";

export default function ProjectCardLanding({ project, onClick }: { project: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer border border-sky-200 rounded-2xl shadow-lg hover:shadow-2xl transition p-6 bg-gradient-to-br from-slate-50 to-sky-100 hover:scale-[1.03] flex flex-col gap-2"
    >
      <h2 className="text-2xl font-bold text-sky-700 mb-1 tracking-tight">{project.title}</h2>
      <p className="text-slate-500 text-sm">Project ID: <span className="font-mono">{project.id}</span></p>
      <div className="flex gap-4 mt-2 text-sm">
        <span className="bg-sky-200 text-sky-800 px-3 py-1 rounded-full">Components: {project.components?.length || 0}</span>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">Outputs: {project.outputs?.length || 0}</span>
      </div>
    </div>
  );
}
