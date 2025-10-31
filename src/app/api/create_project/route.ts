import { NextResponse } from "next/server";
import { createProject } from "@/lib/project/projects_manager";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = body.data;

    console.log("Create Project Data:", data);

    // Create project
    const result = await createProject(data);

   console.log("result",JSON.stringify(result))

    return NextResponse.json({ result }, { status: 201 });


  } catch (error) {
    console.error("❌ Error creating project:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}



