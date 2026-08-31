import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { TicketInput } from "../domain/schemas.js";
import type { KnowledgeDocument } from "../knowledge-base/types.js";

export interface ResponseComposer {
  compose(input: TicketInput, docs: KnowledgeDocument[]): Promise<string>;
}

function compactSources(docs: KnowledgeDocument[]): string {
  return docs
    .map((doc) => `- [${doc.id}] ${doc.title}\n${doc.content.slice(0, 450)}`)
    .join("\n\n");
}

export class TemplateResponseComposer implements ResponseComposer {
  async compose(input: TicketInput, docs: KnowledgeDocument[]): Promise<string> {
    const sourceTitles = docs.map((doc) => doc.title).join(", ");
    return `Según la base de conocimiento (${sourceTitles}), se recomienda seguir estos pasos documentados para "${input.subject}":\n\n${docs[0]?.content
      .split("\n")
      .slice(0, 8)
      .join("\n")
      .trim()}`;
  }
}

export class GeminiResponseComposer implements ResponseComposer {
  private readonly model: ChatGoogleGenerativeAI;

  constructor(apiKey: string, modelName: string) {
    this.model = new ChatGoogleGenerativeAI({
      apiKey,
      model: modelName,
      temperature: 0
    });
  }

  async compose(input: TicketInput, docs: KnowledgeDocument[]): Promise<string> {
    const prompt = [
      "Eres un asistente de soporte interno.",
      "Redacta una propuesta de respuesta SOLO con información explícita de las fuentes.",
      "No inventes pasos ni afirmaciones.",
      `Ticket: ${JSON.stringify(input)}`,
      "Fuentes recuperadas:",
      compactSources(docs),
      "Devuelve únicamente el texto final para el agente de soporte."
    ].join("\n\n");

    const response = await this.model.invoke(prompt);
    return String(response.content);
  }
}
