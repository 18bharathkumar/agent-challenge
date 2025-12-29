import React from "react";
import { Automation } from "@/lib/types/iot-project";
import { Settings } from "lucide-react";

export default function AutomationList({ automations }: { automations: Automation[] }) {
  if (!automations?.length) return <div className="text-gray-500 glass-card rounded-xl p-6">No automations defined.</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-fuchsia-400" />
        Automations
      </h3>
      <div className="glass-card rounded-xl p-6">
        <div className="space-y-3">
          {automations.map((auto) => (
            <div key={auto.id} className="flex flex-col md:flex-row md:items-center gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <span className="font-semibold text-fuchsia-300 text-lg">{auto.name}</span>
              <span className="font-mono text-sm text-gray-400">
                <span className="text-gray-500">Condition:</span> {auto.condition}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
