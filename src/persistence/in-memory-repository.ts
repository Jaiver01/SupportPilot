import { randomUUID } from "node:crypto";
import type { Decision, TicketInput, TicketOutput } from "../domain/schemas.js";
import type { ExecutionRepository } from "./repository.js";

interface StoredExecution {
  ticket: TicketInput;
  decision?: Decision;
  events: Array<{ type: string; payload: unknown }>;
  errors: string[];
}

export class InMemoryExecutionRepository implements ExecutionRepository {
  private readonly store = new Map<string, StoredExecution>();

  async createExecution(ticket: TicketInput): Promise<string> {
    const executionId = randomUUID();
    this.store.set(executionId, { ticket, events: [], errors: [] });
    return executionId;
  }

  async logEvent(executionId: string, eventType: string, payload: unknown): Promise<void> {
    const execution = this.store.get(executionId);
    if (!execution) {
      throw new Error(`Unknown execution ${executionId}`);
    }
    execution.events.push({ type: eventType, payload });
  }

  async logError(executionId: string, message: string): Promise<void> {
    const execution = this.store.get(executionId);
    if (!execution) {
      throw new Error(`Unknown execution ${executionId}`);
    }
    execution.errors.push(message);
  }

  async saveDecision(
    executionId: string,
    _ticket: TicketInput,
    output: TicketOutput,
    reason: string
  ): Promise<void> {
    await this.logEvent(executionId, "decision", { ...output, reason });
  }

  async closeExecution(executionId: string, finalDecision: Decision): Promise<void> {
    const execution = this.store.get(executionId);
    if (!execution) {
      throw new Error(`Unknown execution ${executionId}`);
    }
    execution.decision = finalDecision;
  }
}
