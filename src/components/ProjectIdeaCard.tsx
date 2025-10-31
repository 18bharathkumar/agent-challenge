import React from "react";
import { IotProject } from "@/lib/types/iot-project";

export default function ProjectIdeaCard({ project }: { project: IotProject }) {
  return (
    <div className="bg-white/70 rounded-3xl shadow-xl border border-sky-200 p-8 mb-8">
      <h2 className="text-3xl font-bold text-sky-700 mb-2">{project.title || "Project Idea"}</h2>
      <p className="text-xs text-slate-400 mb-4">ID: {project.id}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-blue-600 mb-3 text-lg">Components</h3>
          <div className="flex flex-col gap-4">
            {project.components?.length ? project.components.map((c, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow border border-blue-200 p-4">
                <div className="font-bold text-blue-700 text-lg mb-1">{c.id}</div>
                <div className="text-slate-600 mb-1">{c.description}</div>
                <div className="text-xs text-slate-500 mb-1">Type: {c.component_type}{c.subtype ? `, ${c.subtype}` : ""}</div>
                {c.unit && <div className="text-xs text-slate-400 mb-1">Unit: {c.unit}</div>}
                {c.pinConnection?.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-semibold text-blue-500 mb-1 text-sm">Pin Connections</h4>
                    <div className="flex flex-col gap-2">
                      {c.pinConnection.map((p, j) => (
                        <div key={j} className="bg-white rounded-lg border border-blue-100 shadow-sm px-3 py-2 flex flex-col">
                          <span className="text-xs text-blue-700 font-semibold">{p.name}</span>
                          <span className="text-xs text-slate-600">Connected to: <span className="font-mono text-blue-600">{p.connected_to}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )) : <div className="text-slate-400">No components</div>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-orange-600 mb-3 text-lg">Outputs</h3>
          <div className="flex flex-col gap-4">
            {project.outputs?.length ? project.outputs.map((o, i) => (
              <div key={i} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow border border-orange-200 p-4">
                <div className="font-bold text-orange-700 text-lg mb-1">{o.name}</div>
                <div className="text-xs text-slate-500 mb-1">Unit: {o.unit || "no unit"}</div>
                <div className="text-xs text-slate-500 mb-1">MQTT Topic: {o.mqtt_topic}</div>
                <div className="text-xs text-slate-500">Component: {o.component_id}</div>
              </div>
            )) : <div className="text-slate-400">No outputs</div>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-green-600 mb-3 text-lg">Triggers</h3>
          <div className="flex flex-col gap-4">
            {project.triggers?.length ? project.triggers.map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow border border-green-200 p-4">
                <div className="font-bold text-green-700 text-lg mb-1">{t.id}</div>
                <div className="text-xs text-slate-500 mb-1">Phrases: {t.phrases.join(", ")}</div>
                <div className="text-xs text-slate-500 mb-1">MQTT Topic: {t.mqtt_topic}</div>
                <div className="text-xs text-green-500 mb-1">Ack Topic: {t.ackTopic}</div>
                <div className="text-xs text-green-700">Action: {t.action.component_id} pin {t.action.pin} → {String(t.action.value)}</div>
              </div>
            )) : <div className="text-slate-400">No triggers</div>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-amber-600 mb-3 text-lg">Automations</h3>
          <div className="flex flex-col gap-4">
            {project.automations?.length ? project.automations.map((a, i) => (
              <div key={i} className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow border border-amber-200 p-4">
                <div className="font-bold text-amber-700 text-lg mb-1">{a.name}</div>
                <div className="text-xs text-slate-500 mb-1">Condition: {a.condition}</div>
                <div className="text-xs text-amber-700">Actions: {a.actions.map((act, j) => `${act.component_id} pin ${act.pin} → ${String(act.value)}`).join(", ")}</div>
              </div>
            )) : <div className="text-slate-400">No automations</div>}
          </div>
        </div>
      </div>
      {project.code && (
        <div className="mt-6">
          <h3 className="font-semibold text-violet-600 mb-2">Generated Code</h3>
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl shadow border border-violet-200 p-4 overflow-x-auto text-xs max-h-64">
            <pre className="bg-transparent text-violet-900 whitespace-pre-wrap">{project.code}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
