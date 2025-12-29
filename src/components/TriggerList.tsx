import React from "react";
import { Trigger } from "@/lib/types/iot-project";
import TriggerCard from "./TriggerCard";
import { Zap } from "lucide-react";

export default function TriggerList({ triggers }: { triggers: Trigger[] }) {
  if (!triggers?.length) return <div className="text-gray-500 glass-card rounded-xl p-6">No triggers defined.</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-cyan-400" />
        Triggers
      </h3>
      <div className="space-y-4">
        {triggers.map((trigger) => (
          <TriggerCard key={trigger.id} trigger={trigger} />
        ))}
      </div>
    </div>
  );
}
