import "dotenv/config";
import { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/* ---------------- ZOD SCHEMAS ---------------- */

const PinSchema = z.object({
  name: z.string(),
  connected_to: z.string(),
});

const ComponentSchema = z.object({
  name: z.string(),
  type: z.enum(["sensor", "output"]),
  subtype: z.enum(["analog", "digital"]).optional(),
  pins: z.array(PinSchema),
  unit: z.string().optional(),
});

const ProjectPlanSchema = z.object({
  project_name: z.string(),
  components: z.array(ComponentSchema),
  automation_logic: z.array(z.string()),
  manual_controls: z.array(z.string()),
});

const TriggerSchema = z.object({
  component: z.string(),
  virtual_pin: z.string(),
  value: z.enum(["HIGH", "LOW"]),
  phrases: z.array(z.string()),
});

const AgentStateIot = z.object({
  generated_projects: z.array(ProjectPlanSchema).default([]),
});

/* ---------------- MODEL SETUP (Gemini Provider) ---------------- */
const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

// Choose the Gemini model you want; "gemini-2.5-flash" is fast and good
const model = gemini("gemini-2.5-flash");

/* ---------------- KNOWLEDGE SECTIONS ---------------- */

const SENSOR_KNOWLEDGE = `
Common sensors:
- Temperature Sensor (analog, unit: °C)
- LDR (analog, unit: lux)
- Moisture Sensor (analog, unit: %)
- Ultrasonic Sensor (digital, unit: cm)
- PIR Sensor (digital, boolean/motion)
`;

const OUTPUT_KNOWLEDGE = `
Common output devices:
- LED, Fan, Buzzer, Relay, Pump, Motor
`;

const PIN_KNOWLEDGE = `
ESP32 Pinout Reference:
- Digital GPIOs: D2 to D23
- Analog Inputs: GPIO36, GPIO39, GPIO34, GPIO35
- Power Pins: 3.3V, 5V, GND

Typical Wiring Patterns:
1. LED:
   - Anode (+) → 220Ω Resistor → GPIO D2
   - Cathode (–) → GND

2. Relay Module:
   - VCC → 5V
   - GND → GND
   - IN → GPIO (e.g., D5, D6, D7)
   - COM → Common terminal for load
   - NO → Normally Open (connects when relay active)
   - NC → Normally Closed (disconnects when relay active)

3. Fan or Motor Control:
   - Controlled via Relay
   - Load Live wire → Relay NO
   - Relay COM → external power supply 
`;

const RELAY_KNOWLEDGE = `
Relay Module Overview:
- Used to control high-power AC or DC devices (fan, motor, lamp) using low-power ESP32 GPIO.
- Pin details:
  • VCC → 5V
  • GND → GND
  • IN → GPIO pin from ESP32
  • COM → Common terminal of relay switch
  • NO → Normally Open terminal (connects to COM when relay ON)
  • NC → Normally Closed terminal (disconnects from COM when relay ON)

Wiring Summary:
- ESP32 controls relay through IN pin.
- Fan or Motor live wire goes through COM and NO terminals of relay.
- Neutral remains directly connected to power supply.
- Always use relay module with optocoupler isolation for safety.
`;

/* ---------------- AGENT SETUP ---------------- */

export const iotAgent = new Agent({
  name: "IoT Project Planner",
  description: "Generates project plan JSON and trigger phrases JSON for IoT automation projects.",
  model,
  instructions: `
You are an expert IoT automation planner and embedded systems engineer.

Your task: From a user prompt, generate **two JSONs** in the same response.

1️⃣ **Project Plan JSON**
- Fields: project_name, components, automation_logic, manual_controls
- Each component includes name, type, subtype (analog/digital), pins (detailed), and unit (if sensor)
- Always include all connection pins (signal, power, ground)
- For high-power devices like Fan or Motor, include a Relay module controlling them
- Clearly show which ESP32 pins control each relay or component

2️⃣ **Trigger Phrases JSON**
- Fields: component, virtual_pin (V1, V2, etc.), value (HIGH/LOW), phrases (2–3 per action)
- Virtual pins correspond to manual_controls in the project plan

Rules:
- Output STRICT JSON only (no markdown, comments, or explanations)
- Use realistic pin mappings for ESP32 (D2–D7 preferred for outputs)
- Fan and Motor must be controlled via Relay modules
- Include both control and power-side wiring in the pin definitions

Knowledge references:
${SENSOR_KNOWLEDGE}

${OUTPUT_KNOWLEDGE}

${PIN_KNOWLEDGE}

${RELAY_KNOWLEDGE}

Example input: "Home automation project controlling LED, fan, and motor"
Expected output:
{
  "project_plan": { ... },
  "triggers": [ ... ]
}
  `,
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: { workingMemory: { enabled: true, schema: AgentStateIot } },
  }),
});
