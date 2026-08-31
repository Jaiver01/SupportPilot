import { z } from "zod";

export const ticketInputSchema = z.object({
  ticket_id: z.string().min(1),
  subject: z.string().min(1),
  description: z.string().min(1),
  user: z
    .object({
      id: z.string().min(1).optional(),
      department: z.string().min(1).optional()
    })
    .optional()
});

export const decisionSchema = z.enum(["RESOLVE", "NEED_INFO", "ESCALATE"]);

export const ticketOutputSchema = z
  .object({
    ticket_id: z.string().min(1),
    decision: decisionSchema,
    confidence: z.number().min(0).max(1),
    response: z.string().min(1),
    sources: z.array(z.string().min(1)),
    reason: z.string().min(1)
  })
  .superRefine((value, ctx) => {
    if (value.decision === "RESOLVE" && value.sources.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sources"],
        message: "RESOLVE requires at least one source."
      });
    }
  });

export type TicketInput = z.infer<typeof ticketInputSchema>;
export type Decision = z.infer<typeof decisionSchema>;
export type TicketOutput = z.infer<typeof ticketOutputSchema>;
