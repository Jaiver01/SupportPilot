import { useMemo, useState } from "react";
import { resolveTicket } from "./api";
import type { ResolveTicketRequest, ResolveTicketResponse } from "./types";

interface FormState {
  ticket_id: string;
  subject: string;
  description: string;
  userId: string;
  userDepartment: string;
}

const initialForm: FormState = {
  ticket_id: "",
  subject: "",
  description: "",
  userId: "",
  userDepartment: ""
};

function badgeClass(decision: ResolveTicketResponse["decision"]): string {
  if (decision === "RESOLVE") return "bg-emerald-600/20 text-emerald-300";
  if (decision === "NEED_INFO") return "bg-amber-600/20 text-amber-300";
  return "bg-rose-600/20 text-rose-300";
}

export function App() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<ResolveTicketResponse | null>(null);

  const isValid = useMemo(() => {
    return (
      form.ticket_id.trim().length > 0 &&
      form.subject.trim().length > 0 &&
      form.description.trim().length > 0
    );
  }, [form]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setApiError("Completa ticket_id, subject y description.");
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setResult(null);

    const payload: ResolveTicketRequest = {
      ticket_id: form.ticket_id.trim(),
      subject: form.subject.trim(),
      description: form.description.trim(),
      user:
        form.userId.trim() || form.userDepartment.trim()
          ? {
              id: form.userId.trim() || undefined,
              department: form.userDepartment.trim() || undefined
            }
          : undefined
    };

    try {
      const output = await resolveTicket(payload);
      setResult(output);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Support Pilot</h1>
        <p className="mt-2 text-sm text-slate-400">
          Agente de resolución asistida de tickets de soporte.
        </p>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-medium">Nuevo ticket</h2>
          <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <label className="text-sm text-slate-300" htmlFor="ticket_id">
                Ticket ID *
              </label>
              <input
                id="ticket_id"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                value={form.ticket_id}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, ticket_id: event.target.value }))
                }
                placeholder="T-1234"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-slate-300" htmlFor="subject">
                Subject *
              </label>
              <input
                id="subject"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                value={form.subject}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, subject: event.target.value }))
                }
                placeholder="No puedo acceder a la VPN"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-slate-300" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                className="min-h-28 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Desde esta manana no puedo conectarme a la VPN."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm text-slate-300" htmlFor="user-id">
                  User ID (opcional)
                </label>
                <input
                  id="user-id"
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                  value={form.userId}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, userId: event.target.value }))
                  }
                  placeholder="U-123"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-slate-300" htmlFor="department">
                  Department (opcional)
                </label>
                <input
                  id="department"
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                  value={form.userDepartment}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      userDepartment: event.target.value
                    }))
                  }
                  placeholder="Engineering"
                />
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Analizando..." : "Analizar ticket"}
              </button>
              <button
                type="button"
                disabled={isLoading}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  setForm(initialForm);
                  setApiError(null);
                  setResult(null);
                }}
              >
                Limpiar
              </button>
            </div>
          </form>
        </section>

        {apiError ? (
          <section className="mt-6 rounded-xl border border-rose-700/40 bg-rose-950/30 p-4 text-sm text-rose-200">
            {apiError}
          </section>
        ) : null}

        {result ? (
          <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-medium">Resultado</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(result.decision)}`}>
                {result.decision}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <dt className="text-slate-400">Ticket ID</dt>
                <dd>{result.ticket_id}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Confidence</dt>
                <dd>{Math.round(result.confidence * 100)}%</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-slate-400">Reason</dt>
                <dd>{result.reason}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-slate-400">Propuesta de respuesta</dt>
                <dd className="whitespace-pre-wrap rounded-md bg-slate-950 p-3">
                  {result.response}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-slate-400">Sources</dt>
                <dd>
                  {result.sources.length > 0 ? (
                    <ul className="list-inside list-disc space-y-1">
                      {result.sources.map((source) => (
                        <li key={source}>{source}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400">Sin fuentes.</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>
        ) : null}
      </div>
    </main>
  );
}
