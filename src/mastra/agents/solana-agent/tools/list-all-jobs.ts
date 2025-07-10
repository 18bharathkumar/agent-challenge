import { createTool } from "@mastra/core";
import { z } from "zod";
import { Client } from "@nosana/sdk";

// Filtering criteria for jobs
const filterDescription = `You can filter jobs by:
- state: The job state (e.g., 0 = pending, 1 = running, 2 = completed, 3 = failed, etc.)
- timeStart: Minimum start time (UNIX timestamp)
- timeEnd: Maximum end time (UNIX timestamp)
- market: Market address (public key)
`;

export const listAllJobsTool = createTool({
  id: "listAllJobs",
  description: `List all Nosana jobs on the network. Optionally filter by state, timeStart, timeEnd, or market.\n${filterDescription}`,
  inputSchema: z.object({
    filters: z.object({
      state: z.number().optional().describe("Job state: 0=pending, 1=running, 2=completed, 3=failed, etc."),
      timeStart: z.number().optional().describe("Minimum start time (UNIX timestamp)"),
      timeEnd: z.number().optional().describe("Maximum end time (UNIX timestamp)"),
      market: z.string().optional().describe("Market address (public key)"),
    }).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    jobs: z.array(z.any()).optional(),
    error: z.string().optional(),
    filteringCriteria: z.string().optional(),
  }),
  execute: async (context: any) => {
    const { filters } = context.context;
    const privateKey: string = process.env.NOSANA_PVT_KEY ?? '';
    if (!privateKey) {
      return { success: false, error: "Missing NOSANA_PVT_KEY in environment variables." };
    }
    try {
      const nosana = new Client('mainnet', privateKey);
      const jobs = await nosana.jobs.all(filters || {});
      const jobsWithExplorer = (jobs || []).map((job: any) => {
        const jobAddress = job?.pubkey?.toString?.() || job?.pubkey || job?.address || job?.job || job;
        return {
          ...job,
          explorerUrl: `https://explorer.solana.com/address/${jobAddress}`,
        };
      });
      return { success: true, jobs: jobsWithExplorer, filteringCriteria: filterDescription };
    } catch (err: any) {
      return { success: false, error: err instanceof Error ? err.message : String(err), filteringCriteria: filterDescription };
    }
  },
}); 