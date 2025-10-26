/* -------------------- IMPORTS -------------------- */
import "dotenv/config";
import { Agent } from "@mastra/core/agent";
import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { fetchComponents } from "@/lib/agent-memory/redis";
import { IotProjectSchema } from "@/lib/types/iot-project";
import { z } from "zod";

function generateJsonTemplate<T extends z.ZodTypeAny>(schema: T): any {
  const type = schema._def.typeName;

  switch (type) {
    case "ZodObject": {
      const shape = schema._def.shape();
      const obj: any = {};
      for (const key in shape) {
        obj[key] = generateJsonTemplate(shape[key]);
      }
      return obj;
    }
    case "ZodArray": {
      const itemType = schema._def.type;
      return [generateJsonTemplate(itemType)];
    }
    case "ZodString":
      return "string";
    case "ZodNumber":
      return 0;
    case "ZodBoolean":
      return false;
    case "ZodOptional":
    case "ZodNullable":
      return generateJsonTemplate(schema._def.innerType);
    case "ZodUnion":
      return generateJsonTemplate(schema._def.options[0]);
    case "ZodEnum":
      return schema._def.values[0];
    default:
      return null;
  }
}

/* -------------------- THREAD ID -------------------- */
const THREAD_ID = "component_knowledge_thread";

/* -------------------- ESP32 PIN KNOWLEDGE -------------------- */
const ESP32_KNOWLEDGE = `
ESP32 GPIO Pin Rules:

Safe Digital Pins: GPIO4, GPIO5, GPIO16, GPIO17, GPIO18, GPIO19, GPIO21, GPIO22, GPIO23
Analog Sensor Pins (ADC1): GPIO32, GPIO33, GPIO34, GPIO35, GPIO36, GPIO39
Never Use: GPIO6-GPIO11 (flash memory)
Input Only: GPIO34-GPIO39 (cannot control LEDs/relays)

Power Connections:
- Sensors, LEDs, Buttons: 3.3V + GND
- Relays: 5V + GND
`;

/* -------------------- AI MODEL SETUP -------------------- */
const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});
const model = gemini("gemini-2.0-flash-exp");

/* -------------------- AGENT MEMORY -------------------- */
export const agentMemory = new Memory({
  storage: new LibSQLStore({ url: "file::memory:" }),
  options: {
    workingMemory: {
      enabled: true,
      schema: generateJsonTemplate(IotProjectSchema),
    },
  },
});

/* -------------------- LOAD COMPONENTS INTO MEMORY -------------------- */
export async function loadComponentsToAgent() {
  const components = await fetchComponents();
  if (!components || components.length === 0) {
    console.warn("⚠️ No components fetched from Redis. Memory not updated.");
    return;
  }

  await agentMemory.__experimental_updateWorkingMemoryVNext({
    threadId: THREAD_ID,
    workingMemory: JSON.stringify({ components }),
    searchString: "IoT components knowledge",
  });

  console.log("✅ Component knowledge loaded into agent memory.");
}

const agentInstructions = `
You are an IoT project planner for ESP32.

RULES:
1. Use components from memory
2. Assign unique GPIO pins (use GPIO4, GPIO5, GPIO16-19 for digital, GPIO32-39 for analog)
3. Include power connections (3.3V/5V + GND)
4. High-power devices (bulbs, fans, motors) MUST use relay modules
5. Outputs include BOTH sensor data AND device states

MQTT Topics:
- Control: {projectId}/device/{device_id} (receives 0 or 1)
- Ack: {projectId}/device/{device_id}/ack (ESP32 confirms with 0 or 1)
- Sensor: {projectId}/sensor/{sensor_name} (ESP32 publishes values)
- Status: {projectId}/status/{device_id} (ESP32 publishes device state)

================================
EXAMPLE:
================================

User: "Control room light based on brightness"

Output:
{
  "id": "smart_lighting",
  "title": "Smart Room Lighting System",
  "components": [
    {
      "id": "ldr_room",
      "description": "LDR light sensor for room brightness detection",
      "component_type": "sensor",
      "subtype": "analog",
      "pinConnection": [
        { "name": "VCC", "connected_to": "3.3V" },
        { "name": "GND", "connected_to": "GND" },
        { "name": "AO", "connected_to": "GPIO34" }
      ],
      "unit": "lux"
    },
    {
      "id": "relay_bulb",
      "description": "1-Channel relay module controlling AC bulb",
      "component_type": "output",
      "subtype": "digital",
      "pinConnection": [
        { "name": "VCC", "connected_to": "5V" },
        { "name": "GND", "connected_to": "GND" },
        { "name": "IN", "connected_to": "GPIO16" },
        { "name": "COM", "connected_to": "AC Live In" },
        { "name": "NO", "connected_to": "Bulb Live" }
      ]
    },
    {
      "id": "bulb_main",
      "description": "AC bulb (220V) for room lighting",
      "component_type": "output",
      "subtype": "digital",
      "pinConnection": [
        { "name": "Live", "connected_to": "Relay NO" },
        { "name": "Neutral", "connected_to": "AC Neutral" }
      ]
    }
  ],
  "triggers": [
    {
      "id": "bulb_on",
      "phrases": ["turn on light", "lights on", "bulb on"],
      "mqtt": "smart_lighting/device/relay_bulb",
      "action": {
        "component_id": "relay_bulb",
        "pin": "GPIO16",
        "value": 1
      },
      "ackTopic": "smart_lighting/device/relay_bulb/ack"
    },
    {
      "id": "bulb_off",
      "phrases": ["turn off light", "lights off", "bulb off"],
      "mqtt": "smart_lighting/device/relay_bulb",
      "action": {
        "component_id": "relay_bulb",
        "pin": "GPIO16",
        "value": 0
      },
      "ackTopic": "smart_lighting/device/relay_bulb/ack"
    }
  ],
  "automations": [
    {
      "id": "auto_light_dark",
      "name": "Turn on bulb when room is dark",
      "condition": "brightness < 500",
      "actions": [
        {
          "component_id": "relay_bulb",
          "pin": "GPIO16",
          "value": 1
        }
      ]
    },
    {
      "id": "auto_light_bright",
      "name": "Turn off bulb when room is bright",
      "condition": "brightness > 1000",
      "actions": [
        {
          "component_id": "relay_bulb",
          "pin": "GPIO16",
          "value": 0
        }
      ]
    }
  ],
  "outputs": [
    {
      "name": "brightness",
      "value": 0,
      "publish_topic": "smart_lighting/sensor/brightness",
      "component_id": "ldr_room"
    },
    {
      "name": "bulb_state",
      "value": 0,
      "publish_topic": "smart_lighting/status/bulb_main",
      "component_id": "bulb_main"
    }
  ]
}

================================

WIRING DIAGRAM:
- LDR Sensor → GPIO34 (analog reading)
- Relay IN → GPIO16 (control signal)
- Relay VCC → 5V, GND → GND
- Relay COM → AC Live (from mains)
- Relay NO → Bulb Live terminal
- Bulb Neutral → AC Neutral (direct)

KEY POINTS:
- Outputs = sensor readings + device states
- High-power devices (bulbs, fans, motors) use relay modules (5V power)
- AC bulb connects through relay (COM → NO terminals)
- Each output device gets: control topic + ack topic + status topic
- Relay IN pin connects to GPIO (GPIO16 in example)
- Use simple names and keep it minimal
- GPIO format: GPIO5, GPIO16, GPIO34 (not D5, etc.)

${ESP32_KNOWLEDGE}
`;


/* -------------------- CREATE AGENT -------------------- */
export const iotAgent = new Agent({
  name: "IoT Project Planner",
  description: "Generates ESP32 IoT project plans",
  model,
  instructions: agentInstructions,
  memory: agentMemory,
});




