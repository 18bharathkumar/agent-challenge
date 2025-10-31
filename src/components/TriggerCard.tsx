import React from "react";
import { Trigger } from "@/lib/types/iot-project";

export default function TriggerCard({ trigger }: { trigger: Trigger }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-sky-100 rounded-2xl shadow-lg border border-green-300 p-6 flex flex-col gap-2 hover:scale-[1.03] transition">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-green-700 text-lg">{trigger.id}</span>
        <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs">{trigger.phrases.length} phrases</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-green-800 font-medium">Phrases: {trigger.phrases.join(", ")}</span>
        <span className="font-mono text-xs text-slate-500">MQTT Topic: {trigger.mqtt_topic}</span>
        <span className="font-mono text-xs text-green-400">Ack: {trigger.ackTopic}</span>
      </div>
    </div>
  );
}
