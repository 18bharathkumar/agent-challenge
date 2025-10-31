import { NextResponse } from "next/server";
import { mastra } from "@/mastra/index";

export async function POST(request: Request) {
  try {
    // Parse JSON body
    const body = await request.json();
    const prompt = body.message;
    const triggers = body.triggers;

    console.log("message:", prompt);
    console.log("triggers:", triggers);

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing 'prompt' in request body" },
        { status: 400 }
      );
    }

    // 🧠 Convert trigger objects to a readable string
    const triggersString = JSON.stringify(triggers, null, 2);

    // Get agent and generate response
    const trigger_agent = mastra.getAgent("trigger_agent");
    const res = await trigger_agent.generateVNext(
      `These are the triggers:\n${triggersString}\n\nBased on the following message, trigger the appropriate device:\n"${prompt}"`
    );

    console.log("Trigger Response:", res.text);

    // Return the response as JSON
    return NextResponse.json({ result: res.text });
  } catch (error) {
    console.error("Error in triggering_agent:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
