import React from "react";
import { Trigger } from "@/lib/types/iot-project";
import TriggerCard from "./TriggerCard";

export default function TriggerList({ triggers }: { triggers: Trigger[] }) {
  if (!triggers?.length) return <div className="text-slate-400">No triggers defined.</div>;
  return (
    <div className="grid gap-6">
      {triggers.map((trigger) => (
        <TriggerCard key={trigger.id} trigger={trigger} />
      ))}
    </div>
  );
}
