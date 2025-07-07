import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { SolanaSPLAgent } from "./agents/solana-spl-agent/solana-spl-agent"; // solana-spl-agent

export const mastra = new Mastra({
	agents: { SolanaSPLAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
