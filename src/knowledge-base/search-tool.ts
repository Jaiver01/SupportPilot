import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import type { KnowledgeBaseSearcher } from "./types.js";

const inputSchema = z.object({
  query: z.string().min(1)
});

export function createSearchKnowledgeBaseTool(searcher: KnowledgeBaseSearcher) {
  return new DynamicStructuredTool({
    name: "search_knowledge_base",
    description: "Busca documentos relevantes dentro de la knowledge base.",
    schema: inputSchema,
    func: async ({ query }) => {
      const results = await searcher.search(query);
      return JSON.stringify({ results });
    }
  });
}
