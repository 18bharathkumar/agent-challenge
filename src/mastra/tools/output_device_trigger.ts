import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import mqtt from "mqtt";

const mqtt_broker = "mqtt://localhost:1883"; // Change to your MQTT broker address

export const trigger = createTool({
  id: "trigger",
  description: "A tool that triggers an action in esp32",
  inputSchema: z.object({
    mqtt_topic: z.string(),
    ack_topic: z.string(),
    msg: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async ({ context }) => {
    const { mqtt_topic, ack_topic, msg } = context;

    return new Promise((resolve) => {
      const client = mqtt.connect(mqtt_broker);
      let ackReceived = false;

      client.on("connect", () => {
        // First, publish the message
        client.publish(mqtt_topic, msg, {}, (err) => {
          // Then subscribe to the ACK topic
          client.subscribe(ack_topic, (subscribeErr) => {
            if (err || subscribeErr) {
              client.end();
              resolve({ success: false });
            }
          });
        });

        // Wait for ACK from the specified topic
        client.on("message", (topic, message) => {
          if (topic === ack_topic) {
            ackReceived = true;
            clearTimeout(timeout);
            client.end();
            resolve({ success: true });
          }
        });

        // Set a timeout for waiting ACK (4 seconds)
        const timeout = setTimeout(() => {
          if (!ackReceived) {
            client.end();
            resolve({ success: false });
          }
        }, 4000);
      });

      client.on("error", () => {
        client.end();
        resolve({ success: false });
      });
    });
  },
});



(async()=>{

  const client = mqtt.connect(mqtt_broker);

  client.on("connect", () => {
    console.log("MQTT Test Client connected");

    client.subscribe("hello",(err)=>{
      if(err){
        console.error("Subscription error:", err);
      }

      console.log("Subscribed to 'hello' topic");
    })
  });

  client.on("message", (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);

    client.publish("hello2", "ACK from test client");
  });


})();
