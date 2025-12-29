import React from "react";
import { Trigger } from "@/lib/types/iot-project";
import { Zap } from "lucide-react";

export default function TriggerCard({ trigger }: { trigger: any }) {
  console.log("trigger", trigger)
  return (
    <div className="glass-card rounded-xl p-5 hover:scale-[1.01] transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-white text-lg">{trigger.id}</span>
        </div>
        <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs border border-cyan-500/30">
          {trigger.phrases.length} phrases
        </span>
      </div>

      <div className="space-y-2 mt-3 pt-3 border-t border-white/10">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Phrases</span>
          <p className="text-cyan-300 font-medium mt-1">{trigger.phrases.join(", ")}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">MQTT Topic</span>
          <p className="font-mono text-xs text-gray-400 mt-1">{trigger.mqtt}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Acknowledgment</span>
          <p className="font-mono text-xs text-cyan-400 mt-1">{trigger.ackTopic}</p>
        </div>
      </div>
    </div>
  );
}
