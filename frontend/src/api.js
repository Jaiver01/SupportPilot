const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";
export async function resolveTicket(payload) {
    const response = await fetch(`${apiBaseUrl}/tickets/resolve`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const raw = (await response.json());
    if (!response.ok) {
        const message = "error" in raw ? raw.error : "Unexpected API error";
        throw new Error(message);
    }
    return raw;
}
