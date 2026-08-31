import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Decision, TicketInput, TicketOutput } from "../domain/schemas.js";
import type { ExecutionRepository } from "./repository.js";

export class SupabaseExecutionRepository implements ExecutionRepository {
  private readonly client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false }
    });
  }

  async createExecution(ticket: TicketInput): Promise<string> {
    const ticketInsert = await this.client
      .from("tickets")
      .upsert(
        {
          ticket_id: ticket.ticket_id,
          subject: ticket.subject,
          description: ticket.description,
          user_id: ticket.user?.id ?? null,
          user_department: ticket.user?.department ?? null
        },
        { onConflict: "ticket_id" }
      )
      .select("id")
      .single();

    if (ticketInsert.error) {
      throw new Error(`Supabase ticket upsert failed: ${ticketInsert.error.message}`);
    }

    const executionInsert = await this.client
      .from("executions")
      .insert({ ticket_ref: ticketInsert.data.id, status: "RUNNING" })
      .select("id")
      .single();

    if (executionInsert.error) {
      throw new Error(
        `Supabase execution insert failed: ${executionInsert.error.message}`
      );
    }

    return executionInsert.data.id as string;
  }

  async logEvent(executionId: string, eventType: string, payload: unknown): Promise<void> {
    const result = await this.client
      .from("events")
      .insert({ execution_ref: executionId, event_type: eventType, payload });
    if (result.error) {
      throw new Error(`Supabase event insert failed: ${result.error.message}`);
    }
  }

  async logError(executionId: string, message: string): Promise<void> {
    const result = await this.client
      .from("errors")
      .insert({ execution_ref: executionId, message });
    if (result.error) {
      throw new Error(`Supabase error insert failed: ${result.error.message}`);
    }
  }

  async saveDecision(
    executionId: string,
    ticket: TicketInput,
    output: TicketOutput,
    reason: string
  ): Promise<void> {
    const decisionInsert = await this.client
      .from("decisions")
      .insert({
        execution_ref: executionId,
        ticket_id: ticket.ticket_id,
        decision: output.decision,
        confidence: output.confidence,
        response: output.response,
        reason
      })
      .select("id")
      .single();

    if (decisionInsert.error) {
      throw new Error(`Supabase decision insert failed: ${decisionInsert.error.message}`);
    }

    if (output.sources.length > 0) {
      const sourcesInsert = await this.client.from("decision_sources").insert(
        output.sources.map((sourceId) => ({
          decision_ref: decisionInsert.data.id,
          source_id: sourceId
        }))
      );

      if (sourcesInsert.error) {
        throw new Error(
          `Supabase decision_sources insert failed: ${sourcesInsert.error.message}`
        );
      }
    }
  }

  async closeExecution(executionId: string, finalDecision: Decision): Promise<void> {
    const result = await this.client
      .from("executions")
      .update({ status: "DONE", final_decision: finalDecision })
      .eq("id", executionId);

    if (result.error) {
      throw new Error(`Supabase execution update failed: ${result.error.message}`);
    }
  }
}
