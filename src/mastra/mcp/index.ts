import { MCPServer } from "@mastra/mcp"
import { PinControlTool } from "../tools/output_device_trigger";
import { iotAgent } from "../agents";


export const server = new MCPServer({
  name: "My Custom Server",
  version: "1.0.0",
  tools: { PinControlTool },
  agents: { iotAgent }, // this agent will become tool "ask_weatherAgent"
  // workflows: {
  // dataProcessingWorkflow, // this workflow will become tool "run_dataProcessingWorkflow"
  // }
});
