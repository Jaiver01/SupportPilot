import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { resolveTicket } from "./api";
const initialForm = {
    ticket_id: "",
    subject: "",
    description: "",
    userId: "",
    userDepartment: ""
};
function badgeClass(decision) {
    if (decision === "RESOLVE")
        return "bg-emerald-600/20 text-emerald-300";
    if (decision === "NEED_INFO")
        return "bg-amber-600/20 text-amber-300";
    return "bg-rose-600/20 text-rose-300";
}
export function App() {
    const [form, setForm] = useState(initialForm);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [result, setResult] = useState(null);
    const isValid = useMemo(() => {
        return (form.ticket_id.trim().length > 0 &&
            form.subject.trim().length > 0 &&
            form.description.trim().length > 0);
    }, [form]);
    const onSubmit = async (event) => {
        event.preventDefault();
        if (!isValid) {
            setApiError("Completa ticket_id, subject y description.");
            return;
        }
        setIsLoading(true);
        setApiError(null);
        setResult(null);
        const payload = {
            ticket_id: form.ticket_id.trim(),
            subject: form.subject.trim(),
            description: form.description.trim(),
            user: form.userId.trim() || form.userDepartment.trim()
                ? {
                    id: form.userId.trim() || undefined,
                    department: form.userDepartment.trim() || undefined
                }
                : undefined
        };
        try {
            const output = await resolveTicket(payload);
            setResult(output);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            setApiError(message);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("main", { className: "min-h-screen bg-slate-950 text-slate-100", children: _jsxs("div", { className: "mx-auto w-full max-w-5xl px-6 py-10", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Support Pilot" }), _jsx("p", { className: "mt-2 text-sm text-slate-400", children: "Agente de resoluci\u00F3n asistida de tickets de soporte." }), _jsxs("section", { className: "mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6", children: [_jsx("h2", { className: "text-lg font-medium", children: "Nuevo ticket" }), _jsxs("form", { className: "mt-4 grid gap-4", onSubmit: onSubmit, children: [_jsxs("div", { className: "grid gap-2", children: [_jsx("label", { className: "text-sm text-slate-300", htmlFor: "ticket_id", children: "Ticket ID *" }), _jsx("input", { id: "ticket_id", className: "rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2", value: form.ticket_id, onChange: (event) => setForm((prev) => ({ ...prev, ticket_id: event.target.value })), placeholder: "T-1234" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx("label", { className: "text-sm text-slate-300", htmlFor: "subject", children: "Subject *" }), _jsx("input", { id: "subject", className: "rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2", value: form.subject, onChange: (event) => setForm((prev) => ({ ...prev, subject: event.target.value })), placeholder: "No puedo acceder a la VPN" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx("label", { className: "text-sm text-slate-300", htmlFor: "description", children: "Description *" }), _jsx("textarea", { id: "description", className: "min-h-28 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2", value: form.description, onChange: (event) => setForm((prev) => ({ ...prev, description: event.target.value })), placeholder: "Desde esta manana no puedo conectarme a la VPN." })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx("label", { className: "text-sm text-slate-300", htmlFor: "user-id", children: "User ID (opcional)" }), _jsx("input", { id: "user-id", className: "rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2", value: form.userId, onChange: (event) => setForm((prev) => ({ ...prev, userId: event.target.value })), placeholder: "U-123" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx("label", { className: "text-sm text-slate-300", htmlFor: "department", children: "Department (opcional)" }), _jsx("input", { id: "department", className: "rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2", value: form.userDepartment, onChange: (event) => setForm((prev) => ({
                                                        ...prev,
                                                        userDepartment: event.target.value
                                                    })), placeholder: "Engineering" })] })] }), _jsxs("div", { className: "mt-2 flex items-center gap-3", children: [_jsx("button", { type: "submit", disabled: isLoading, className: "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60", children: isLoading ? "Analizando..." : "Analizar ticket" }), _jsx("button", { type: "button", disabled: isLoading, className: "rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60", onClick: () => {
                                                setForm(initialForm);
                                                setApiError(null);
                                                setResult(null);
                                            }, children: "Limpiar" })] })] })] }), apiError ? (_jsx("section", { className: "mt-6 rounded-xl border border-rose-700/40 bg-rose-950/30 p-4 text-sm text-rose-200", children: apiError })) : null, result ? (_jsxs("section", { className: "mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("h2", { className: "text-lg font-medium", children: "Resultado" }), _jsx("span", { className: `rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(result.decision)}`, children: result.decision })] }), _jsxs("dl", { className: "mt-4 grid gap-3 text-sm md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-slate-400", children: "Ticket ID" }), _jsx("dd", { children: result.ticket_id })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-slate-400", children: "Confidence" }), _jsxs("dd", { children: [Math.round(result.confidence * 100), "%"] })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("dt", { className: "text-slate-400", children: "Reason" }), _jsx("dd", { children: result.reason })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("dt", { className: "text-slate-400", children: "Propuesta de respuesta" }), _jsx("dd", { className: "whitespace-pre-wrap rounded-md bg-slate-950 p-3", children: result.response })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("dt", { className: "text-slate-400", children: "Sources" }), _jsx("dd", { children: result.sources.length > 0 ? (_jsx("ul", { className: "list-inside list-disc space-y-1", children: result.sources.map((source) => (_jsx("li", { children: source }, source))) })) : (_jsx("span", { className: "text-slate-400", children: "Sin fuentes." })) })] })] })] })) : null] }) }));
}
