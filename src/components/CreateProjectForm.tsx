"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  components: any[];
  outputs: any[];
};

export default function CreateProjectForm({ onCreated }: { onCreated?: (p: Project) => void }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Title is required");
    setLoading(true);
    try {
  const payload = { title: title.trim() };
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Status ${res.status}`);
      }
      const created = await res.json();
      onCreated?.(created);
      setTitle("");
      // Navigate to project page
      router.push(`/projects/${created.id}`);
    } catch (err: any) {
      setError(String(err.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 p-6 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <label className="text-sm text-slate-300">Project Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-md p-3 bg-white/5 focus:outline-none border border-transparent focus:border-white/20"
            placeholder="e.g. Greenhouse Controller"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-md text-sm">
            {loading ? "Creating..." : "Create Project"}
          </button>
          <button type="button" onClick={() => setTitle("")} className="px-4 py-3 bg-white/5 rounded-md text-sm">
            Clear
          </button>
        </div>
      </div>
      {error && <p className="text-rose-400 mt-3">{error}</p>}
    </form>
  );
}
