import {z} from "zod";

const PinConnection = z.object({
  name: z.string(),
  connected_to: z.string(),
});

// Defines each IoT component
const ComponentSchema = z.object({
  id: z.string(),
  description: z.string(),
  component_type: z.enum(["sensor", "output"]),
  subtype: z.enum(["analog", "digital"]).optional(),
  pinConnection: z.array(PinConnection),
  unit: z.string().optional(),
});

// Defines what values can be published/sent to topics (ONLY FOR SENSORS)
const OutputSchema = z.object({
  name: z.string(),
  mqtt_topic: z.string(),
  component_id: z.string(), 
  unit:z.string()
});

// Describes what action to take when a trigger occurs
const ActionSchema = z.object({
  component_id: z.string(),
  pin: z.string(),
  value: z.union([z.number(), z.boolean()]),
});

// Defines a voice or MQTT-based trigger
const TriggerSchema = z.object({
  id: z.string(),
  phrases: z.array(z.string()),
  mqtt_topic: z.string(), // Topic where command (0 or 1) is published
  action: ActionSchema,
  ackTopic: z.string(), // Topic where ESP32 publishes acknowledgment
});

// Defines logic-based automation rules
const AutomationSchema = z.object({
  id: z.string(),
  name: z.string(),
  condition: z.string(), // e.g. "temperature > 30"
  actions: z.array(ActionSchema),
});

/* -------------------- PROJECT SCHEMA -------------------- */
export const IotProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  components: z.array(ComponentSchema),
  triggers: z.array(TriggerSchema).optional(),
  automations: z.array(AutomationSchema).optional(),
  outputs: z.array(OutputSchema), // Only sensor readings, NOT device states
});

/* -------------------- EXPORT TYPES -------------------- */
export type IotProject = z.infer<typeof IotProjectSchema> & {
  code: string;
};
export type Component = z.infer<typeof ComponentSchema>;
export type Trigger = z.infer<typeof TriggerSchema>;
export type Automation = z.infer<typeof AutomationSchema>;
export type Output = z.infer<typeof OutputSchema>;
