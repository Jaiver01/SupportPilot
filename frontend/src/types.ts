export interface ResolveTicketRequest {
  ticket_id: string;
  subject: string;
  description: string;
  user?: {
    id?: string;
    department?: string;
  };
}

export interface ResolveTicketResponse {
  ticket_id: string;
  decision: "RESOLVE" | "NEED_INFO" | "ESCALATE";
  confidence: number;
  response: string;
  sources: string[];
  reason: string;
}
