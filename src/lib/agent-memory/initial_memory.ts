import { redis } from "./redis";
import { Component } from "../types/iot-component";

// Initial component knowledge (generic, no ESP32 pin assigned yet)
// Agent will dynamically assign pins based on project requirements
const initialComponents: Component[] = [
  // ========== OUTPUT DEVICES (Digital) ==========
  {
    id: "led",
    title: "LED",
    type: "output",
    subtype: "digital",
    pins: [
      { name: "Anode (+)", connected_to: "" },
      { name: "Cathode (-)", connected_to: "GND" }
    ],
    description: "Standard white LED (5mm). Requires 220Ω resistor. Operating voltage: 2-3.3V. Current: 20mA."
  },
  {
    id: "relay_1ch",
    title: "1-Channel Relay Module",
    type: "output",
    subtype: "digital",
    pins: [
      { name: "VCC", connected_to: "5V" },
      { name: "GND", connected_to: "GND" },
      { name: "IN", connected_to: "" }
    ],
    description: "Single channel 5V relay module. Controls high-power AC/DC devices. Max load: 10A @ 250VAC or 10A @ 30VDC. Used for fans, bulbs, motors, pumps."
  },
  {
    id: "relay_2ch",
    title: "2-Channel Relay Module",
    type: "output",
    subtype: "digital",
    pins: [
      { name: "VCC", connected_to: "5V" },
      { name: "GND", connected_to: "GND" },
      { name: "IN1", connected_to: "" },
      { name: "IN2", connected_to: "" }
    ],
    description: "Dual channel 5V relay module. Controls two high-power devices independently. Max load per channel: 10A @ 250VAC."
  },
  {
    id: "relay_4ch",
    title: "4-Channel Relay Module",
    type: "output",
    subtype: "digital",
    pins: [
      { name: "VCC", connected_to: "5V" },
      { name: "GND", connected_to: "GND" },
      { name: "IN1", connected_to: "" },
      { name: "IN2", connected_to: "" },
      { name: "IN3", connected_to: "" },
      { name: "IN4", connected_to: "" }
    ],
    description: "Four channel 5V relay module. Controls four high-power devices independently. Ideal for home automation projects."
  },
  {
    id: "buzzer",
    title: "Buzzer Module",
    type: "output",
    subtype: "digital",
    pins: [
      { name: "IN", connected_to: "" },
      { name: "GND", connected_to: "GND" },
    ],
    description: "Active buzzer module. Generates fixed tone when powered. Operating voltage: 3.3-5V. Current: 30mA. Used for alarms and notifications."
  },
  {
    id: "servo_sg90",
    title: "SG90 Micro Servo Motor",
    type: "output",
    subtype: "digital",
    pins: [
      { name: "VCC", connected_to: "5V" },
      { name: "GND", connected_to: "GND" },
      { name: "Signal", connected_to: "" }
    ],
    description: "Micro servo motor with 180° rotation. Controlled via PWM signal (50Hz). Operating voltage: 4.8-6V. Current: 100-250mA. Used for door locks, camera mounts."
  },

  // ========== SENSORS (Digital) ==========
  {
    id: "dht11",
    title: "DHT11 Temperature & Humidity Sensor",
    type: "sensor",
    subtype: "digital",
    unit: "°C / %",
    pins: [
      { name: "VCC", connected_to: "3.3V" },
      { name: "GND", connected_to: "GND" },
      { name: "DATA", connected_to: "" }
    ],
    description: "Digital temperature (0-50°C) and humidity (20-90%) sensor. Accuracy: ±2°C, ±5%RH. Reading interval: 2 seconds. Budget-friendly option."
  },
  {
    id: "pir_hc_sr501",
    title: "PIR Motion Sensor (HC-SR501)",
    type: "sensor",
    subtype: "digital",
    unit: "boolean",
    pins: [
      { name: "VCC", connected_to: "5V" },
      { name: "GND", connected_to: "GND" },
      { name: "OUT", connected_to: "" }
    ],
    description: "Passive Infrared motion sensor. Detection range: 3-7 meters. Detection angle: 120°. Adjustable sensitivity and delay time (0.3s-5min). Used for security systems."
  },
  {
    id: "ultrasonic_hcsr04",
    title: "HC-SR04 Ultrasonic Distance Sensor",
    type: "sensor",
    subtype: "digital",
    unit: "cm",
    pins: [
      { name: "VCC", connected_to: "5V" },
      { name: "GND", connected_to: "GND" },
      { name: "TRIG", connected_to: "" },
      { name: "ECHO", connected_to: "" }
    ],
    description: "Ultrasonic distance sensor. Measuring range: 2cm - 400cm. Accuracy: 3mm. Detection angle: 15°. Used for parking sensors, obstacle detection, water level."
  },
  {
    id: "ir_obstacle",
    title: "IR Obstacle Avoidance Sensor",
    type: "sensor",
    subtype: "digital",
    unit: "boolean",
    pins: [
      { name: "VCC", connected_to: "3.3V" },
      { name: "GND", connected_to: "GND" },
      { name: "OUT", connected_to: "" }
    ],
    description: "Infrared obstacle detection sensor. Detection distance: 2-30cm (adjustable via potentiometer). Output: LOW when obstacle detected. Used in robots, automation."
  },
 
  // ========== SENSORS (Analog) ==========
  {
    id: "ldr_light",
    title: "LDR Light Sensor Module",
    type: "sensor",
    subtype: "analog",
    unit: "ADC (0-4095)",
    pins: [
      { name: "VCC", connected_to: "3.3V" },
      { name: "GND", connected_to: "GND" },
      { name: "AO", connected_to: "" }
    ],
    description: "Light Dependent Resistor module. Analog output (0-4095 ADC). Higher value = more light. Used for automatic lighting, day/night detection, solar trackers."
  },
  {
    id: "soil_moisture",
    title: "Capacitive Soil Moisture Sensor",
    type: "sensor",
    subtype: "analog",
    unit: "% (0-100)",
    pins: [
      { name: "VCC", connected_to: "3.3V" },
      { name: "GND", connected_to: "GND" },
      { name: "AOUT", connected_to: "" }
    ],
    description: "Capacitive soil moisture sensor. Analog output (0-4095 ADC). Lower value = more moisture. Corrosion resistant. Used for automatic plant watering systems."
  },
  {
    id: "mq2_gas",
    title: "MQ-2 Gas Sensor Module",
    type: "sensor",
    subtype: "analog",
    unit: "ppm (0-4095)",
    pins: [
      { name: "VCC", connected_to: "5V" },
      { name: "GND", connected_to: "GND" },
      { name: "AO", connected_to: "" },
      { name: "DO", connected_to: "" }
    ],
    description: "Gas sensor detects LPG, propane, methane, hydrogen, alcohol, smoke. Detection range: 300-10000ppm. Requires 24-48h preheat. Used for gas leak alarms, air quality."
  },
  {
    id: "mq135_air",
    title: "MQ-135 Air Quality Sensor",
    type: "sensor",
    subtype: "analog",
    unit: "ppm (0-4095)",
    pins: [
      { name: "VCC", connected_to: "5V" },
      { name: "GND", connected_to: "GND" },
      { name: "AO", connected_to: "" }
    ],
    description: "Air quality sensor detects NH3, NOx, alcohol, benzene, smoke, CO2. Detection range: 10-1000ppm. Used for indoor air quality monitoring, ventilation control."
  },
  {
    id: "rain_sensor",
    title: "Rain Drop Detection Sensor",
    type: "sensor",
    subtype: "analog",
    unit: "ADC (0-4095)",
    pins: [
      { name: "VCC", connected_to: "3.3V" },
      { name: "GND", connected_to: "GND" },
      { name: "AO", connected_to: "" }
    ],
    description: "Rain detection sensor with analog output. Lower value = more water detected. Used for automatic roof/window closing, irrigation control, weather stations."
  },
  {
    id: "flame_sensor",
    title: "Flame Detection Sensor",
    type: "sensor",
    subtype: "analog",
    unit: "ADC (0-4095)",
    pins: [
      { name: "VCC", connected_to: "3.3V" },
      { name: "GND", connected_to: "GND" },
      { name: "AO", connected_to: "" },
      { name: "DO", connected_to: "" }
    ],
    description: "Infrared flame detection sensor. Wavelength: 760-1100nm. Detection angle: 60°. Range: 0-100cm. Lower analog value = flame detected. Used for fire alarms."
  },
  {
    id: "ph_sensor",
    title: "pH Sensor Module",
    type: "sensor",
    subtype: "analog",
    unit: "pH (0-14)",
    pins: [
      { name: "VCC", connected_to: "5V" },
      { name: "GND", connected_to: "GND" },
      { name: "PO", connected_to: "" }
    ],
    description: "Analog pH sensor with BNC probe. Measurement range: 0-14 pH. Accuracy: ±0.1pH. Requires calibration. Used for aquariums, hydroponics, water testing."
  },
];

async function initComponents() {
  try {
    await redis.set("components_knowledge", JSON.stringify(initialComponents));
    
    const sensorCount = initialComponents.filter(c => c.type === 'sensor').length;
    const outputCount = initialComponents.filter(c => c.type === 'output').length;
    const digitalCount = initialComponents.filter(c => c.subtype === 'digital').length;
    const analogCount = initialComponents.filter(c => c.subtype === 'analog').length;
    
    console.log(`✅ Initialized ${initialComponents.length} components in Redis memory!`);
    console.log(`\n📦 Component breakdown:`);
    console.log(`   - Total Sensors: ${sensorCount}`);
    console.log(`   - Total Outputs: ${outputCount}`);
    console.log(`   - Digital components: ${digitalCount}`);
    console.log(`   - Analog components: ${analogCount}`);
    console.log(`\n🎯 Component categories:`);
    console.log(`   - LEDs: 4`);
    console.log(`   - Relays: 3 (1ch, 2ch, 4ch)`);
    console.log(`   - Buzzers & Servos: 4`);
    console.log(`   - Environmental sensors: 6 (temp, humidity, air quality)`);
    console.log(`   - Motion/Proximity: 4 (PIR, ultrasonic, IR, vibration)`);
    console.log(`   - Analog sensors: 11 (light, soil, gas, water quality, etc.)`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to initialize components:", err);
    process.exit(1);
  }
}

initComponents();
