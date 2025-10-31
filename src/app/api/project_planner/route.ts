import { NextResponse } from "next/server";
import { mastra } from "@/mastra/index";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing 'prompt' in request body" },
        { status: 400 }
      );
    }

    // Get agent and generate response
    const trigger = mastra.getAgent("iotAgent");
    const res = await trigger.generateVNext(prompt);

    let msg = true;
    let responseData: any;

    try {
      // Step 1: Clean text and extract JSON block if present
      let text = res.text.trim();

      // Handles patterns like ```json ... ``` or ``` ... ```
      if (text.includes("```")) {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          text = match[1].trim();
        }
      }

      // Step 2: Try parsing JSON
      const project = JSON.parse(text);

      console.log("Parsed Project Data:", JSON.stringify(project));


      msg = false;
      responseData = { msg, project };
    } catch (err) {
      console.error("Error parsing or validating project data:", err);
      // Parsing or validation failed
      responseData = { msg, message: res.text };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in POST /api:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
