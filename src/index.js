const JOKES = [
    "I would tell you a joke about construction, but I'm still working on it.",
    "I used to hate facial hair, but then it grew on me.",
    "Why don't eggs tell jokes? They'd crack each other up.",
    "I only know 25 letters of the alphabet. I don't know y.",
    "I'm reading a book about anti-gravity. It's impossible to put down.",
    "Did you hear about the restaurant on the moon? Great food, no atmosphere.",
    "I ordered a chicken and an egg from Amazon. I'll let you know.",
    "What do you call cheese that isn't yours? Nacho cheese.",
    "I don't trust stairs. They're always up to something.",
    "How does a penguin build its house? Igloos it together.",
    "Why did the scarecrow win an award? Because he was outstanding in his field.",
    "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    "Want to hear a joke about paper? Never mind, it's tearable.",
    "Why don't skeletons fight each other? They don't have the guts.",
    "How do you organize a space party? You planet.",
    "Why did the math book look sad? It had too many problems.",
    "I'm on a seafood diet. I see food and I eat it.",
    "Why can't your nose be 12 inches long? Because then it would be a foot.",
    "Why did the bicycle fall over? It was two-tired.",
    "Parallel lines have so much in common. It's a shame they'll never meet.",
    "Why did the golfer bring two pairs of pants? In case he got a hole in one.",
    "What do you call fake spaghetti? An impasta.",
    "Why did the computer go to therapy? It had too many bytes of anxiety.",
    "I told my computer I needed a break, and it froze.",
    "Why don't oysters donate to charity? Because they’re shellfish.",
    "Why can't you hear a pterodactyl go to the bathroom? Because the P is silent.",
    "What do you call a belt made of watches? A waist of time.",
    "What do you call a factory that makes good products? A satisfactory.",
    "Why did the cookie go to the hospital? Because it felt crumby.",
    "Why did the tomato turn red? Because it saw the salad dressing."
];

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "content-type": "application/json; charset=utf-8" }
    });
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function rpcJokesGet() {
    return { joke: pick(JOKES) };
}

async function rpcJokesSearch(params = {}) {
    const q = String(params.q || "").toLowerCase().trim();
    const limit = Math.max(1, Math.min(Number(params.limit || 3), 10));
    const items = (q ? JOKES.filter(j => j.toLowerCase().includes(q)) : JOKES).slice(0, limit);
    return { items, total: items.length };
}

export default {
    async fetch(request) {
        const url = new URL(request.url);

        if (request.method === "GET" && url.pathname === "/health") {
            return json({ ok: true, service: "mcp-dadjokes", time: new Date().toISOString() });
        }

        if (request.method === "POST" && url.pathname === "/rpc") {
            let payload;
            try {
                payload = await request.json();
            } catch {
                return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } }, 400);
            }

            const handle = async (call) => {
                if (!call || call.jsonrpc !== "2.0" || typeof call.method !== "string") {
                    return { jsonrpc: "2.0", id: call?.id, error: { code: -32600, message: "Invalid request" } };
                }
                const { id, method, params } = call;
                try {
                    if (method === "jokes.get")  return { jsonrpc: "2.0", id, result: await rpcJokesGet() };
                    if (method === "jokes.search") return { jsonrpc: "2.0", id, result: await rpcJokesSearch(params) };
                    if (method === "health.ping")  return { jsonrpc: "2.0", id, result: { ok: true, service: "mcp-dadjokes" } };
                    return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
                } catch (e) {
                    return { jsonrpc: "2.0", id, error: { code: -32000, message: "Server error", data: { message: e?.message || String(e) } } };
                }
            };

            if (Array.isArray(payload)) {
                if (payload.length === 0) return json([{ jsonrpc: "2.0", error: { code: -32600, message: "Invalid request" } }], 400);
                const results = await Promise.all(payload.map(handle));
                return json(results, results.some(r => r?.error) ? 400 : 200);
            } else {
                const result = await handle(payload);
                return json(result, result?.error ? 400 : 200);
            }
        }
        return new Response("Not found", { status: 404 });
    }
};