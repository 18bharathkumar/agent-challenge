import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { SolanaAgent } from "./agents/solana-agent/solana-agent"; // solana-spl-agent

export const mastra = new Mastra({
	agents: { SolanaAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
