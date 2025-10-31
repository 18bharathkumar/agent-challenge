import { NextResponse } from "next/server";
import { mastra } from "@/mastra/index";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const project = body.project;

    if (!project || typeof project !== "object") {
      return NextResponse.json(
        { error: "Invalid or missing 'project' object in request body" },
        { status: 400 }
      );
    }

    // Get the ESP32 code generator agent
    const codeGenerator = mastra.getAgent("esp32_code_generator_agent");
    const res = await codeGenerator.generateVNext(JSON.stringify(project));

    let msg = true;
    let responseData: any;

    try {
      // Step 1: Extract code block if model wrapped it in ``` ```
      let codeText = res.text.trim();

      if (codeText.includes("```")) {
        const match = codeText.match(/```(?:cpp|c|arduino)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          codeText = match[1].trim();
        }
      }

      // Step 2: Return the code cleanly
      msg = false;
      responseData = { msg, code: codeText };
    } catch (err) {
      console.error("Error extracting code from response:", err);
      responseData = { msg, message: res.text };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in POST /api/esp32-code:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
