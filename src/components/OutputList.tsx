import React, { useRef } from "react";
import { Output } from "@/lib/types/iot-project";

export default function OutputList({ outputs, outputValues, onVoiceTrigger }: { outputs: Output[]; outputValues: Record<string, any>; onVoiceTrigger?: (output: Output) => void }) {
  const recognitionRef = useRef<any>(null);

  function handleVoice(output: Output) {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser.');
      return;
    }
    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
    }
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (onVoiceTrigger) onVoiceTrigger(output);
      alert(`Voice trigger for ${output.name}: ${transcript}`);
    };
    recognitionRef.current.start();
  }

  if (!outputs?.length) return <div className="text-slate-400">No outputs defined.</div>;
  return (
    <div className="grid gap-6">
      {outputs.map((out) => (
        <div key={out.component_id} className="bg-gradient-to-br from-sky-50 to-sky-200 rounded-xl shadow-lg border border-sky-300 p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-700 text-lg">{out.name}</span>
            <button
              className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded-full shadow transition flex items-center gap-2"
              onClick={() => handleVoice(out)}
              title="Voice Trigger"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="8" rx="3" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              Voice
            </button>
          </div>
          <div className="flex gap-3 items-center">
            <span className="font-mono text-xs text-slate-500">{out.mqtt_topic}</span>
            <span className="ml-2 text-blue-700 font-medium">{outputValues[out.mqtt_topic] ?? "No value yet"}</span>
            {out.unit && <span className="ml-2 text-xs text-slate-400">{out.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
