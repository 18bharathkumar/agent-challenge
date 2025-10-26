import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import mqtt from 'mqtt';

export const MQTTPinToolResultSchema = z.object({
  topic: z.string(),
  pin: z.string(),
  state: z.boolean(),
  status: z.string(), // "activated" or "device offline"
});

export type MQTTPinToolResult = z.infer<typeof MQTTPinToolResultSchema>;

export const PinControlTool = createTool({
  id: 'pin-control',
  description: 'controll the esp32 output device',
  inputSchema: z.object({
    projectId: z.string().describe('Project ID'),
    pin: z.string().describe('Pin name '),
    state: z.boolean().describe('Pin state '),
    brokerUrl: z.string().default('mqtt://localhost:1883').describe('MQTT broker URL'),
    timeout: z.number().default(5000).describe('Time to wait for ack (ms)'),
  }),


  outputSchema: MQTTPinToolResultSchema,

  
  execute: async ({ context }) => {
    const { projectId, pin, state, brokerUrl, timeout } = context;
    const publishTopic = `${projectId}/${pin}`;
    const ackTopic = `${projectId}/${pin}/ack`;
    const message = JSON.stringify({ pin, state });

    return new Promise<MQTTPinToolResult>((resolve, reject) => {
      const client = mqtt.connect(brokerUrl);
      let timeoutHandler: NodeJS.Timeout;

      client.on('connect', () => {
        // Subscribe to ack topic
        client.subscribe(ackTopic, (err) => {
          if (err) {
            client.end();
            return reject(err);
          }

          // Publish the pin state
          client.publish(publishTopic, message, (err) => {
            if (err) {
              client.end();
              return reject(err);
            }

            // Timeout in case device doesn't respond
            timeoutHandler = setTimeout(() => {
              client.end();
              resolve({ topic: publishTopic, pin, state, status: 'device offline' });
            }, timeout);
          });
        });
      });

      client.on('message', (recvTopic, payload) => {
        if (recvTopic === ackTopic) {
          try {
            const data = JSON.parse(payload.toString());
            // Optional: verify pin/state in ack if needed
            clearTimeout(timeoutHandler);
            client.end();
            resolve({ topic: publishTopic, pin, state, status: 'activated' });
          } catch {
            // Ignore invalid JSON
          }
        }
      });

      client.on('error', (err) => {
        clearTimeout(timeoutHandler);
        client.end();
        reject(err);
      });
    });
  },
});
