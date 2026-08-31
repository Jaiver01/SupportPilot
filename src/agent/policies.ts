import type { KnowledgeDocument } from "../knowledge-base/types.js";
import type { Decision, TicketInput } from "../domain/schemas.js";

const injectionPatterns = [
  /ignora (todas )?(las )?instrucciones/i,
  /ignore (all )?previous instructions/i,
  /revela(r)? (el )?(system prompt|prompt del sistema)/i,
  /(api key|credential|credencial|secreto)/i,
  /bypass (all )?security/i,
  /disable (all )?security/i,
  /turn off (all )?security/i,
  /circumvent (all )?security/i,
];

const prohibitedActionPatterns = [
  /ejecuta(r)? comando/i,
  /run (a )?command/i,
  /cambia(r)? (mi )?contrasena/i,
  /reset(ear)? password/i,
  /modifica(r)? permisos/i,
  /grant admin/i,
];

const oppositePairs: Array<[string, string]> = [
  ["habilitar", "deshabilitar"],
  ["enable", "disable"],
  ["siempre", "nunca"],
  ["always", "never"],
];

export function textFromTicket(ticket: TicketInput): string {
  return `${ticket.subject}\n${ticket.description}`.toLowerCase();
}

export function hasPromptInjectionAttempt(ticket: TicketInput): boolean {
  const text = textFromTicket(ticket);
  return injectionPatterns.some((pattern) => pattern.test(text));
}

export function asksForProhibitedAction(ticket: TicketInput): boolean {
  const text = textFromTicket(ticket);
  return prohibitedActionPatterns.some((pattern) => pattern.test(text));
}

export function missingEssentialInformation(ticket: TicketInput): boolean {
  const trimmed = ticket.description.trim();
  return trimmed.length < 12;
}

export function ambiguousTicket(ticket: TicketInput): boolean {
  const words = ticket.description.trim().split(/\s+/).length;
  return words < 5;
}

export function decideWithoutKb(ticket: TicketInput): {
  decision: Decision;
  reason: string;
  response: string;
} | null {
  if (missingEssentialInformation(ticket)) {
    return {
      decision: "NEED_INFO",
      reason: "La descripción del problema es insuficiente para diagnosticar.",
      response: "Necesito más detalles para ayudarte. Indica el error exacto, cuándo ocurre y qué intentaste.",
    };
  }

  if (ambiguousTicket(ticket)) {
    return {
      decision: "NEED_INFO",
      reason: "El ticket es ambiguo y no permite identificar el problema con precisión.",
      response:
        "Para continuar, necesito más contexto del incidente (sistema afectado, mensaje de error y pasos para reproducir).",
    };
  }

  if (asksForProhibitedAction(ticket)) {
    return {
      decision: "ESCALATE",
      reason: "La solicitud requiere una acción fuera de las capacidades permitidas del agente.",
      response:
        "No puedo ejecutar acciones operativas (comandos, cambios de permisos o contraseñas). Escalo el ticket para intervención humana.",
    };
  }

  return null;
}

export function hasContradictoryInformation(documents: KnowledgeDocument[]): boolean {
  if (documents.length < 2) {
    return false;
  }

  const text = documents.map((doc) => doc.content.toLowerCase()).join("\n");
  return oppositePairs.some(([positive, negative]) => text.includes(positive) && text.includes(negative));
}
