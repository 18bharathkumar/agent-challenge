import { ZodError } from "zod";
import { IoTProject } from "./IotProject";
import type { IotProject as IotProjectType } from "../types/iot-project";
import { redis } from "@/lib/agent-memory/redis";

const PROJECT_SET_KEY = "projects:ids"; // Redis set key for storing all project IDs

export const createProject = async (
  data: unknown
): Promise<IoTProject | { error: string; issues: any }> => {
  try {
    const projectData = data as IotProjectType;

    

    if(!projectData.id || !projectData.title || !projectData.outputs || !projectData.components || !projectData.code){
      return {
        error: "Validation failed for IoTProject data",
        issues: "Missing required fields: id, title, components, outputs, or code",
      };
    }

    // Create project instance
    const project = new IoTProject({
      id: projectData.id,
      title: projectData.title,
      outputs: projectData.outputs,
      components: projectData.components,
      triggers: projectData.triggers ?? [],
      code:projectData.code??'',
    });

    console.log("project:",JSON.stringify(project))

    // ✅ Store project data in Redis (serialize it)
    await redis.set(`project:${project.id}`, JSON.stringify(project));

    const result = await redis.get(`project:${project.id}`);
    console.log("Stored project data in Redis:", result);

    // ✅ Add project ID to Redis Set
    await redis.sadd(PROJECT_SET_KEY, project.id);

    return project;
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        error: "Validation failed for IoTProject data",
        issues: err.errors,
      };
    }
    throw err;
  }
};

export const getAllProjects = async (): Promise<IoTProject[]> => {
  const ids = await redis.smembers(PROJECT_SET_KEY);
  const projects: IoTProject[] = [];

  for (const id of ids) {
    const data = await redis.get(`project:${id}`);
    if (data) projects.push(JSON.parse(data));
  }

  return projects;
};






