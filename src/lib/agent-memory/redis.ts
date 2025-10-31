import Redis from "ioredis";
import { Component } from "../types/iot-project";

export const redis = new Redis({ host: "127.0.0.1", port: 6379 });

// Helper to fetch component knowledge from Redis
export async function fetchComponents(): Promise<Component[]> {
    const data = await redis.get("components_knowledge");
    return data ? JSON.parse(data) : [];
}

// Helper to add/update a component in Redis
export async function updateComponent(newComponent: Component) {
    const components = await fetchComponents();
    const index = components.findIndex(c => c.id === newComponent.id);
    if (index >= 0) {
        components[index] = newComponent; // update
    } else {
        components.push(newComponent); // add
    }
    await redis.set("components_knowledge", JSON.stringify(components));
}
