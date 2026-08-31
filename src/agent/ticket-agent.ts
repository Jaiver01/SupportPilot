import type { DynamicStructuredTool } from "@langchain/core/tools";
import { ticketInputSchema, ticketOutputSchema, type TicketInput, type TicketOutput } from "../domain/schemas.js";
import type { KnowledgeDocument } from "../knowledge-base/types.js";
import type { ExecutionRepository } from "../persistence/repository.js";
import type { ResponseComposer } from "./response-composer.js";
import { decideWithoutKb, hasContradictoryInformation, hasPromptInjectionAttempt } from "./policies.js";

function toConfidence(relevance: number): number {
  const confidence = Math.max(0.05, Math.min(0.99, relevance));
  return Number(confidence.toFixed(2));
}

function parseToolResult(raw: string): KnowledgeDocument[] {
  const parsed = JSON.parse(raw) as { results?: KnowledgeDocument[] };
  return Array.isArray(parsed.results) ? parsed.results : [];
}

export class TicketAgentService {
  constructor(
    private readonly searchTool: DynamicStructuredTool,
    private readonly composer: ResponseComposer,
    private readonly repository: ExecutionRepository,
  ) {}

  async resolveTicket(input: unknown): Promise<TicketOutput> {
    const ticket = ticketInputSchema.parse(input);
    const executionId = await this.repository.createExecution(ticket);

    await this.repository.logEvent(executionId, "ticket_received", {
      ticket_id: ticket.ticket_id,
    });

    try {
      const fastDecision = decideWithoutKb(ticket);
      if (fastDecision) {
        const output: TicketOutput = {
          ticket_id: ticket.ticket_id,
          decision: fastDecision.decision,
          confidence: fastDecision.decision === "NEED_INFO" ? 0.95 : 0.9,
          response: fastDecision.response,
          sources: [],
          reason: fastDecision.reason,
        };
        ticketOutputSchema.parse(output);
        await this.repository.saveDecision(executionId, ticket, output, output.reason);
        await this.repository.closeExecution(executionId, output.decision);
        return output;
      }

      const injectionDetected = hasPromptInjectionAttempt(ticket);
      if (injectionDetected) {
        await this.repository.logEvent(executionId, "prompt_injection_detected", {
          ticket_id: ticket.ticket_id,
        });
      }

      const query = `${ticket.subject}\n${ticket.description}`;
      await this.repository.logEvent(executionId, "search_attempt", { attempt: 1, query });
      let searchRaw: string;

      try {
        searchRaw = await this.searchTool.invoke({ query });
      } catch (error) {
        const firstError = error instanceof Error ? error.message : "Unknown search error";
        await this.repository.logError(executionId, `attempt_1: ${firstError}`);
        await this.repository.logEvent(executionId, "search_attempt", {
          attempt: 2,
          query,
        });
        try {
          searchRaw = await this.searchTool.invoke({ query });
        } catch (secondError) {
          const secondMessage = secondError instanceof Error ? secondError.message : "Unknown search error";
          await this.repository.logError(executionId, `attempt_2: ${secondMessage}`);
          const output: TicketOutput = {
            ticket_id: ticket.ticket_id,
            decision: "ESCALATE",
            confidence: 0.98,
            response:
              "No pude consultar la base de conocimiento tras reintentar una vez. Escalo el ticket para revisión humana.",
            sources: [],
            reason: "Fallo de acceso a la base de conocimiento tras dos intentos.",
          };
          ticketOutputSchema.parse(output);
          await this.repository.saveDecision(executionId, ticket, output, output.reason);
          await this.repository.closeExecution(executionId, output.decision);
          return output;
        }
      }

      let documents = parseToolResult(searchRaw);
      await this.repository.logEvent(executionId, "search_results", {
        count: documents.length,
        sourceIds: documents.map((doc) => doc.id),
      });

      if (documents.length === 0 || documents[0].relevance < 0.4) {
        const output: TicketOutput = {
          ticket_id: ticket.ticket_id,
          decision: "ESCALATE",
          confidence: 0.88,
          response:
            "No encontré una solución suficientemente respaldada en la knowledge base. Escalo para análisis humano.",
          sources: [],
          reason: "No existe documentación aplicable al caso en la KB.",
        };
        ticketOutputSchema.parse(output);
        await this.repository.saveDecision(executionId, ticket, output, output.reason);
        await this.repository.closeExecution(executionId, output.decision);
        return output;
      }

      documents = documents.filter((doc) => doc?.relevance && doc.relevance > 0.4);

      if (hasContradictoryInformation(documents.slice(0, 3))) {
        const output: TicketOutput = {
          ticket_id: ticket.ticket_id,
          decision: "ESCALATE",
          confidence: 0.93,
          response:
            "La knowledge base contiene información contradictoria para este caso. Escalo para validación humana.",
          sources: documents.slice(0, 3).map((doc) => doc.id),
          reason: "Se detectó contradicción entre documentos relevantes.",
        };
        ticketOutputSchema.parse(output);
        await this.repository.saveDecision(executionId, ticket, output, output.reason);
        await this.repository.closeExecution(executionId, output.decision);
        return output;
      }

      const selectedDocs = documents.slice(0, 3);
      const response = await this.composer.compose(ticket, selectedDocs);
      const output: TicketOutput = {
        ticket_id: ticket.ticket_id,
        decision: "RESOLVE",
        confidence: toConfidence(selectedDocs[0].relevance),
        response,
        sources: selectedDocs.map((doc) => doc.id),
        reason: "La base de conocimiento contiene un procedimiento aplicable y suficiente.",
      };

      ticketOutputSchema.parse(output);
      await this.repository.saveDecision(executionId, ticket, output, output.reason);
      await this.repository.closeExecution(executionId, output.decision);
      return output;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown agent error";
      await this.repository.logError(executionId, message);
      await this.repository.closeExecution(executionId, "ESCALATE");
      throw error;
    }
  }
}
