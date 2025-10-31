import mqtt from "mqtt";

// 🔹 MQTT broker URL (WebSocket or TCP)
const MQTT_BROKER = process.env.MQTT_URL || "mqtt://localhost:1883";

// 🔹 Topics
const SUBSCRIBE_TOPIC = "home_automation/device/relay_fan";
const ACK_TOPIC = "home_automation/device/relay_fan/ack";

// 🔹 Create MQTT client
const client = mqtt.connect(MQTT_BROKER);

// 🔹 When connected
client.on("connect", () => {
  console.log(`✅ Connected to MQTT broker at ${MQTT_BROKER}`);
  
  // Subscribe to main topic
  client.subscribe(SUBSCRIBE_TOPIC, (err) => {
    if (err) console.error("❌ Subscription error:", err);
    else console.log(`📡 Subscribed to topic: ${SUBSCRIBE_TOPIC}`);
  });
});

// 🔹 When a message is received
client.on("message", (topic, message) => {
  const msg = message.toString();
  console.log(`💡 Received from ${topic}: ${msg}`);

  // Prepare acknowledgment payload
  const ackMessage = `ACK: received "${msg}"`;

  // Publish acknowledgment
  client.publish(ACK_TOPIC, ackMessage, { qos: 1 }, (err) => {
    if (err) console.error("❌ Error sending ack:", err);
    else console.log(`📨 Sent acknowledgment to ${ACK_TOPIC}: ${ackMessage}`);
  });
});

// 🔹 Handle connection errors
client.on("error", (err) => {
  console.error("🚨 MQTT connection error:", err);
  client.end();
});

