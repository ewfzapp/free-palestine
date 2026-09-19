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

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ipHash = await sha256(ip);
    const seenKey = `seen:${ipHash}`;

    let current = parseInt((await env.COUNTER.get("visits")) || "0", 10);
    const alreadySeen = await env.COUNTER.get(seenKey);

    if (!alreadySeen) {
      current += 1;
      await env.COUNTER.put("visits", String(current));
      await env.COUNTER.put(seenKey, "1");
    }

    return new Response(JSON.stringify({ count: current }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
