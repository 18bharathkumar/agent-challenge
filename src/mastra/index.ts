import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { SolanaNosanaAgent } from "./agents/solana-agent/solana-agent"; // solana-spl-agent

export const mastra = new Mastra({
	agents: { SolanaNosanaAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
