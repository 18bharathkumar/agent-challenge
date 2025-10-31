// updateComponentRuntime.ts
import { updateComponent, fetchComponents } from "./redis"
import { agentMemory } from "@/mastra/agents/project_planner";
import { Component } from "../types/iot-project";

export async function addOrUpdateComponent(newComponent: Component) {
    // Update Redis first
    await updateComponent(newComponent);

    // Reload into agent memory
    const components = await fetchComponents();
    await agentMemory.__experimental_updateWorkingMemoryVNext({
        threadId: "component_knowledge_thread",
        workingMemory: JSON.stringify(components),
        searchString: "IoT components knowledge"
    });
}
