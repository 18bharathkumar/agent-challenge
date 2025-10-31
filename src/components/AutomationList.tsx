import React from "react";
import { Automation } from "@/lib/types/iot-project";

export default function AutomationList({ automations }: { automations: Automation[] }) {
  if (!automations?.length) return <div className="text-slate-400">No automations defined.</div>;
  return (
    <div className="bg-white rounded-xl shadow p-4 border border-amber-200">
      <h3 className="text-lg font-bold text-amber-700 mb-2">Automations</h3>
      <ul className="space-y-2">
        {automations.map((auto) => (
          <li key={auto.id} className="flex flex-col md:flex-row md:items-center gap-2">
            <span className="font-semibold text-amber-800">{auto.name}</span>
            <span className="font-mono text-xs text-slate-500">Condition: {auto.condition}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
