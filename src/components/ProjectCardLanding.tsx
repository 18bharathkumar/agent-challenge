"use client";
import React, { useState } from "react";
import { Box, Zap, MoreVertical, Trash2 } from "lucide-react";

export default function ProjectCardLanding({
  project,
  onClick,
  onDelete
}: {
  project: any;
  onClick: () => void;
  onDelete?: (projectId: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      onDelete?.(project.id);
    }
    setShowMenu(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowMenu(!showMenu);
  };

  return (
    <div
      onClick={onClick}
      className="group relative glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-violet-500/10 animate-slide-up"
    >
      {/* Animated gradient border glow - much more subtle */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 opacity-0 group-hover:opacity-5 blur-lg transition-opacity duration-500 -z-10" />

      {/* Three-dot menu */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />

              {/* Menu content */}
              <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-lg shadow-xl border border-white/20 overflow-hidden z-20">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 transition-colors text-left text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Delete Project</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Project Icon */}
        <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 mb-4 shadow-md shadow-violet-500/20">
          <Box className="w-6 h-6 text-white" />
        </div>

        {/* Project Title */}
        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors duration-300">
          {project.title}
        </h2>

        {/* Project ID */}
        <p className="text-gray-500 text-xs font-mono mb-4">
          ID: {project.id.slice(0, 8)}...
        </p>

        {/* Stats */}
        <div className="flex gap-3 mt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/15 transition-colors duration-300">
            <Box className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-violet-300">
              {project.components?.length || 0}
            </span>
            <span className="text-xs text-gray-400">Components</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 group-hover:bg-fuchsia-500/15 transition-colors duration-300">
            <Zap className="w-4 h-4 text-fuchsia-400" />
            <span className="text-sm font-semibold text-fuchsia-300">
              {project.outputs?.length || 0}
            </span>
            <span className="text-xs text-gray-400">Outputs</span>
          </div>
        </div>

        {/* Hover indicator line - more subtle */}
        <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-full transition-all duration-500" />
      </div>
    </div>
  );
}
