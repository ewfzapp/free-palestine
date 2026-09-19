export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const current = parseInt((await env.COUNTER.get("visits")) || "0", 10);
    const next = current + 1;
    await env.COUNTER.put("visits", String(next));

    return new Response(JSON.stringify({ count: next }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};
