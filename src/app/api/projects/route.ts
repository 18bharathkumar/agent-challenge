import { NextResponse } from "next/server";
import { redis } from "@/lib/agent-memory/redis";

const PROJECT_SET_KEY = "projects:ids";

// GET → Fetch all stored projects
export async function GET() {
  try {
    // 1️⃣ Get all project IDs from the Redis set
    const ids = await redis.smembers(PROJECT_SET_KEY);

    // 2️⃣ Fetch each project's data
    const projects = [];
    for (const id of ids) {
      const data = await redis.get(`project:${id}`);
      if (data) projects.push(JSON.parse(data));
    }

    // 3️⃣ Return projects as JSON
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("Error retrieving projects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve projects" },
      { status: 500 }
    );
  }
}

// DELETE → Remove a project by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Remove project data from Redis
    await redis.del(`project:${projectId}`);

    // Remove project ID from the set
    await redis.srem(PROJECT_SET_KEY, projectId);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

