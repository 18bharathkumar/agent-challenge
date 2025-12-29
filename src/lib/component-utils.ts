import {
    Activity,
    Gauge,
    Thermometer,
    Droplets,
    Wind,
    Lightbulb,
    Zap,
    Volume2,
    Monitor,
    Cog,
    RotateCw,
    DoorClosed,
    Camera,
    Radio,
    Wifi,
    LucideIcon
} from "lucide-react";

// Component type to icon and visual mapping
export const COMPONENT_VISUALS: Record<string, {
    icon: LucideIcon;
    gradient: string;
    category: string;
    image?: string;
}> = {
    // Sensors
    "pir_motion": {
        icon: Activity,
        gradient: "from-cyan-500 to-blue-600",
        category: "Motion Sensor",
        image: "C:/Users/dhars/.gemini/antigravity/brain/e340c53d-9e63-44e5-a964-e2f4e6e198a2/pir_motion_sensor_1766515555637.png"
    },
    "pir": {
        icon: Activity,
        gradient: "from-cyan-500 to-blue-600",
        category: "Motion Sensor",
        image: "C:/Users/dhars/.gemini/antigravity/brain/e340c53d-9e63-44e5-a964-e2f4e6e198a2/pir_motion_sensor_1766515555637.png"
    },
    "ultrasonic": {
        icon: Radio,
        gradient: "from-cyan-500 to-blue-600",
        category: "Distance Sensor",
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&q=80"
    },
    "dht": {
        icon: Thermometer,
        gradient: "from-green-500 to-emerald-600",
        category: "Temp/Humidity Sensor",
        image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop&q=80"
    },
    "temperature": {
        icon: Thermometer,
        gradient: "from-orange-500 to-red-600",
        category: "Temperature Sensor",
        image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&h=300&fit=crop&q=80"
    },
    "humidity": {
        icon: Droplets,
        gradient: "from-blue-500 to-cyan-600",
        category: "Humidity Sensor",
        image: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&h=300&fit=crop&q=80"
    },
    "gas": {
        icon: Wind,
        gradient: "from-yellow-500 to-orange-600",
        category: "Gas Sensor",
        image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=300&fit=crop&q=80"
    },
    "light": {
        icon: Lightbulb,
        gradient: "from-yellow-400 to-amber-500",
        category: "Light Sensor",
        image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop&q=80"
    },
    "soil_moisture": { icon: Droplets, gradient: "from-green-600 to-emerald-700", category: "Soil Moisture" },
    "soil": {
        icon: Droplets,
        gradient: "from-green-600 to-emerald-700",
        category: "Soil Moisture",
        image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop&q=80"
    },
    "moisture": {
        icon: Droplets,
        gradient: "from-green-600 to-emerald-700",
        category: "Soil Moisture",
        image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop&q=80"
    },
    "camera": {
        icon: Camera,
        gradient: "from-purple-500 to-pink-600",
        category: "Camera Module",
        image: "https://images.unsplash.com/photo-1606166325683-00e0b1cf9d98?w=400&h=300&fit=crop&q=80"
    },

    // Outputs/Actuators
    "led": {
        icon: Lightbulb,
        gradient: "from-yellow-500 to-orange-600",
        category: "LED",
        image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&h=300&fit=crop&q=80"
    },
    "relay": {
        icon: Zap,
        gradient: "from-violet-500 to-purple-600",
        category: "Relay Module",
        image: "C:/Users/dhars/.gemini/antigravity/brain/e340c53d-9e63-44e5-a964-e2f4e6e198a2/relay_module_1766515574059.png"
    },
    "buzzer": {
        icon: Volume2,
        gradient: "from-red-500 to-pink-600",
        category: "Buzzer/Alarm",
        image: "https://images.unsplash.com/photo-1545259741-2ab98664ab09?w=400&h=300&fit=crop&q=80"
    },
    "alarm": {
        icon: Volume2,
        gradient: "from-red-500 to-pink-600",
        category: "Buzzer/Alarm",
        image: "https://images.unsplash.com/photo-1558618666-764d2a679dd4?w=400&h=300&fit=crop&q=80"
    },
    "siren": {
        icon: Volume2,
        gradient: "from-red-500 to-pink-600",
        category: "Alarm Siren",
        image: "https://images.unsplash.com/photo-1609157636539-b1e40ea92b8f?w=400&h=300&fit=crop&q=80"
    },
    "servo": {
        icon: Cog,
        gradient: "from-indigo-500 to-purple-600",
        category: "Servo Motor",
        image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&h=300&fit=crop&q=80"
    },
    "stepper": {
        icon: RotateCw,
        gradient: "from-blue-500 to-indigo-600",
        category: "Stepper Motor",
        image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop&q=80"
    },
    "motor": {
        icon: RotateCw,
        gradient: "from-gray-600 to-gray-700",
        category: "DC Motor",
        image: "https://images.unsplash.com/photo-1581092583537-20d51b2c2daf?w=400&h=300&fit=crop&q=80"
    },
    "solenoid": {
        icon: DoorClosed,
        gradient: "from-slate-600 to-gray-700",
        category: "Solenoid Lock",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80"
    },
    "lcd": {
        icon: Monitor,
        gradient: "from-teal-500 to-cyan-600",
        category: "LCD Display",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop&q=80"
    },
    "wifi": {
        icon: Wifi,
        gradient: "from-blue-400 to-cyan-500",
        category: "WiFi Module",
        image: "https://images.unsplash.com/photo-1606166325683-00e0b1cf9d98?w=400&h=300&fit=crop&q=80"
    },

    // Default fallbacks
    "sensor": {
        icon: Activity,
        gradient: "from-cyan-500 to-blue-600",
        category: "Sensor",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&q=80"
    },
    "output": {
        icon: Zap,
        gradient: "from-violet-500 to-fuchsia-600",
        category: "Output Device",
        image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=400&h=300&fit=crop&q=80"
    },
};

// Component pricing database (estimated USD)
export const COMPONENT_PRICES: Record<string, { min: number; max: number }> = {
    // Sensors
    "pir_motion": { min: 1, max: 3 },
    "ultrasonic": { min: 2, max: 5 },
    "dht": { min: 3, max: 7 },
    "dht11": { min: 2, max: 4 },
    "dht22": { min: 4, max: 8 },
    "temperature": { min: 2, max: 6 },
    "humidity": { min: 3, max: 7 },
    "gas": { min: 3, max: 8 },
    "light": { min: 1, max: 3 },
    "ldr": { min: 0.5, max: 2 },
    "soil_moisture": { min: 2, max: 5 },
    "camera": { min: 8, max: 25 },

    // Outputs/Actuators
    "led": { min: 0.1, max: 0.5 },
    "relay": { min: 2, max: 5 },
    "buzzer": { min: 1, max: 3 },
    "servo": { min: 3, max: 15 },
    "stepper": { min: 8, max: 25 },
    "motor": { min: 2, max: 10 },
    "solenoid": { min: 5, max: 15 },
    "lcd": { min: 3, max: 12 },
    "oled": { min: 5, max: 15 },
    "wifi": { min: 3, max: 8 },

    // Default
    "sensor": { min: 2, max: 10 },
    "output": { min: 2, max: 10 },
    "esp32": { min: 5, max: 12 },
};

export function getComponentVisual(componentId: string, componentType: string) {
    const id = componentId.toLowerCase();

    // Try to match by ID keywords
    for (const [key, visual] of Object.entries(COMPONENT_VISUALS)) {
        if (id.includes(key)) {
            return visual;
        }
    }

    // Fallback to component type
    return COMPONENT_VISUALS[componentType] || COMPONENT_VISUALS["sensor"];
}

export function getComponentPrice(componentId: string): { min: number; max: number } {
    const id = componentId.toLowerCase();

    // Try to match by ID keywords
    for (const [key, price] of Object.entries(COMPONENT_PRICES)) {
        if (id.includes(key)) {
            return price;
        }
    }

    // Default price range
    return { min: 2, max: 10 };
}

export function formatPrice(price: { min: number; max: number }): string {
    if (price.min === price.max) {
        return `$${price.min}`;
    }
    return `$${price.min}-${price.max}`;
}

export function calculateTotalCost(components: any[]): { min: number; max: number } {
    let minTotal = 0;
    let maxTotal = 0;

    components.forEach(comp => {
        const price = getComponentPrice(comp.id);
        minTotal += price.min;
        maxTotal += price.max;
    });

    // Add ESP32 board cost
    const esp32Price = COMPONENT_PRICES["esp32"];
    minTotal += esp32Price.min;
    maxTotal += esp32Price.max;

    return { min: Math.round(minTotal), max: Math.round(maxTotal) };
}
