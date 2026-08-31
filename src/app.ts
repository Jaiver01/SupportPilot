import Fastify from "fastify";
import cors from "@fastify/cors";
import path from "node:path";
import { getConfig } from "./config.js";
import { TicketAgentService } from "./agent/ticket-agent.js";
import { GeminiResponseComposer, TemplateResponseComposer } from "./agent/response-composer.js";
import { MarkdownKnowledgeBaseSearcher } from "./knowledge-base/markdown-searcher.js";
import { createSearchKnowledgeBaseTool } from "./knowledge-base/search-tool.js";
import { createExecutionRepository } from "./persistence/create-repository.js";

export function createApp() {
  const config = getConfig();
  const app = Fastify({ logger: true });

  const searcher = new MarkdownKnowledgeBaseSearcher(path.resolve(process.cwd(), config.KB_PATH));
  const searchTool = createSearchKnowledgeBaseTool(searcher);
  const composer =
    config.GOOGLE_API_KEY && config.GEMINI_MODEL ?
      new GeminiResponseComposer(config.GOOGLE_API_KEY, config.GEMINI_MODEL)
    : new TemplateResponseComposer();
  const repository = createExecutionRepository(config);
  const agent = new TicketAgentService(searchTool, composer, repository);

  void app.register(cors, {
    origin: config.FRONTEND_ORIGIN,
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.post("/tickets/resolve", async (request, reply) => {
    try {
      const result = await agent.resolveTicket(request.body);
      return reply.status(200).send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      return reply.status(400).send({ error: message });
    }
  });

  return app;
}
