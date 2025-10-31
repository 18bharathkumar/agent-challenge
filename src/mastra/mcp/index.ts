import { MCPServer } from "@mastra/mcp"
import { trigger } from "../tools/output_device_trigger";
import { iotAgent } from "../agents";


export const server = new MCPServer({
  name: "My Custom Server",
  version: "1.0.0",
  tools: { trigger },
  agents: { iotAgent }, 
  // workflows: {
  // dataProcessingWorkflow, // this workflow will become tool "run_dataProcessingWorkflow"
  // }
});




