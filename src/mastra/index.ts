import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { researchAgent } from "./agents/research-agent/research-agent";

export const mastra = new Mastra({
	// workflows: { weatherWorkflow }, // can be deleted later
	agents: { researchAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 60000,
	},
});
