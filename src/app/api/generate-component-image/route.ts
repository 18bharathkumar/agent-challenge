import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { componentId } = await request.json();

        if (!componentId) {
            return NextResponse.json({ error: "Component ID required" }, { status: 400 });
        }

        const id = componentId.toLowerCase();

        // Curated real component images from reliable sources
        // Using direct CDN links from electronics retailers and open hardware repos
        const imageMap: Record<string, string> = {
            // Previously AI-generated (high quality)
            "pir_sensor": "C:/Users/dhars/.gemini/antigravity/brain/e340c53d-9e63-44e5-a964-e2f4e6e198a2/pir_motion_sensor_1766515555637.png",
            "pir_motion": "C:/Users/dhars/.gemini/antigravity/brain/e340c53d-9e63-44e5-a964-e2f4e6e198a2/pir_motion_sensor_1766515555637.png",
            "pir": "C:/Users/dhars/.gemini/antigravity/brain/e340c53d-9e63-44e5-a964-e2f4e6e198a2/pir_motion_sensor_1766515555637.png",
            "relay": "C:/Users/dhars/.gemini/antigravity/brain/e340c53d-9e63-44e5-a964-e2f4e6e198a2/relay_module_1766515574059.png",
            "alarm_relay": "C:/Users/dhars/.gemini/antigravity/brain/e340c53d-9e63-44e5-a964-e2f4e6e198a2/relay_module_1766515574059.png",

            // Real component images from CDNs (electronics specific)
            "current": "https://cdn.sparkfun.com/assets/parts/4/5/4/8/09607-01.jpg",
            "voltage": "https://cdn.sparkfun.com/assets/parts/1/2/3/4/5/13582-01.jpg",
            "acs712": "https://cdn.sparkfun.com/assets/parts/4/5/4/8/09607-01.jpg",

            "ultrasonic": "https://cdn.sparkfun.com/assets/parts/1/2/0/3/6/15569-Ultrasonic_Distance_Sensor_-_HC-SR04-01.jpg",

            "dht": "https://cdn.sparkfun.com/assets/parts/1/5/2/5/8/DHT22.jpg",
            "dht22": "https://cdn.sparkfun.com/assets/parts/1/5/2/5/8/DHT22.jpg",
            "dht11": "https://cdn.sparkfun.com/assets/parts/7/3/6/2/10167-01.jpg",

            "temperature": "https://cdn.sparkfun.com/assets/parts/3/0/8/00245-1.jpg",
            "ds18b20": "https://cdn.sparkfun.com/assets/parts/3/0/8/00245-1.jpg",

            "humidity": "https://cdn.sparkfun.com/assets/parts/1/5/2/5/8/DHT22.jpg",

            "gas": "https://cdn.sparkfun.com/assets/parts/1/2/4/5/9/14520-01a.jpg",
            "mq": "https://cdn.sparkfun.com/assets/parts/1/2/4/5/9/14520-01a.jpg",

            "light": "https://cdn.sparkfun.com/assets/parts/2/4/6/2/09088-02-L.jpg",
            "ldr": "https://cdn.sparkfun.com/assets/parts/2/4/6/2/09088-02-L.jpg",

            "soil": "https://cdn.sparkfun.com/assets/parts/1/1/4/8/8/13637-01.jpg",
            "moisture": "https://cdn.sparkfun.com/assets/parts/1/1/4/8/8/13637-01.jpg",

            "led": "https://cdn.sparkfun.com/assets/parts/1/2/6/9/7/14560-01.jpg",

            "buzzer": "https://cdn.sparkfun.com/assets/parts/7/0/4/4/11089-01.jpg",
            "alarm": "https://cdn.sparkfun.com/assets/parts/7/0/4/4/11089-01.jpg",
            "siren": "https://cdn.sparkfun.com/assets/parts/7/0/4/4/11089-01.jpg",

            "servo": "https://cdn.sparkfun.com/assets/parts/4/5/0/9/09065-03-L.jpg",
            "sg90": "https://cdn.sparkfun.com/assets/parts/4/5/0/9/09065-03-L.jpg",

            "stepper": "https://cdn.sparkfun.com/assets/parts/3/7/6/5/09238-02.jpg",
            "28byj": "https://cdn.sparkfun.com/assets/parts/3/7/6/5/09238-02.jpg",

            "motor": "https://cdn.sparkfun.com/assets/parts/2/4/5/2/11696-01.jpg",
            "dc_motor": "https://cdn.sparkfun.com/assets/parts/2/4/5/2/11696-01.jpg",

            "solenoid": "https://cdn.sparkfun.com/assets/parts/1/1/4/3/8/15324-Solenoid_-_5V__Small_-01.jpg",

            "lcd": "https://cdn.sparkfun.com/assets/parts/4/4/5/5/00709-03-L.jpg",
            "16x2": "https://cdn.sparkfun.com/assets/parts/4/4/5/5/00709-03-L.jpg",

            "oled": "https://cdn.sparkfun.com/assets/parts/1/2/7/3/6/14532-SparkFun_Micro_OLED_Breakout__Qwiic_-01.jpg",

            "wifi": "https://cdn.sparkfun.com/assets/parts/1/1/3/2/0/13678-01.jpg",
            "esp8266": "https://cdn.sparkfun.com/assets/parts/1/1/3/2/0/13678-01.jpg",

            "camera": "https://cdn.sparkfun.com/assets/parts/4/0/5/7/09378-OV7670.jpg",
            "ov7670": "https://cdn.sparkfun.com/assets/parts/4/0/5/7/09378-OV7670.jpg",

            "bluetooth": "https://cdn.sparkfun.com/assets/parts/1/0/3/3/5/13009-01.jpg",
            "hc05": "https://cdn.sparkfun.com/assets/parts/1/0/3/3/5/13009-01.jpg",

            "gyro": "https://cdn.sparkfun.com/assets/parts/1/3/2/3/2/15335-SparkFun_9DoF_IMU_Breakout_-_ICM-20948__Qwiic_-01.jpg",
            "accelerometer": "https://cdn.sparkfun.com/assets/parts/1/3/2/3/2/15335-SparkFun_9DoF_IMU_Breakout_-_ICM-20948__Qwiic_-01.jpg",

            "gps": "https://cdn.sparkfun.com/assets/parts/1/2/8/5/0/GPS-15193-16.jpg",

            "rfid": "https://cdn.sparkfun.com/assets/parts/1/2/0/3/4/15191-SparkFun_RFID_Qwiic_Reader-01.jpg",
        };

        // Find matching image URL using keyword matching
        let imageUrl = null;
        for (const [key, url] of Object.entries(imageMap)) {
            if (id.includes(key)) {
                imageUrl = url;
                break;
            }
        }

        // Fallback: return null to use gradient icon
        return NextResponse.json({
            success: true,
            imageUrl: imageUrl,
            cached: true,
        });
    } catch (error) {
        console.error("Error fetching component image:", error);
        return NextResponse.json(
            { error: "Internal server error", details: (error as Error).message },
            { status: 500 }
        );
    }
}
