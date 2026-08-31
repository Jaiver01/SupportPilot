import type { Decision, TicketInput, TicketOutput } from "../domain/schemas.js";

export interface ExecutionRepository {
  createExecution(ticket: TicketInput): Promise<string>;
  logEvent(executionId: string, eventType: string, payload: unknown): Promise<void>;
  logError(executionId: string, message: string): Promise<void>;
  saveDecision(
    executionId: string,
    ticket: TicketInput,
    output: TicketOutput,
    reason: string
  ): Promise<void>;
  closeExecution(executionId: string, finalDecision: Decision): Promise<void>;
}
