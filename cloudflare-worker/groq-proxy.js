/**
 * Cloudflare Worker: Groq API Proxy for Choco Toffee Support Call
 * 
 * Deploy steps:
 * 1. Go to https://dash.cloudflare.com/ → Workers → Create a Worker
 * 2. Paste this code in the editor
 * 3. Go to Settings → Variables → Add Secret: GROQ_API_KEY = your_groq_key
 * 4. Deploy and copy the worker URL
 * 5. Update GROQ_CF_ENDPOINT in docs/main.js with: https://your-worker.workers.dev/api/chat
 *
 * To get a free Groq API key: https://console.groq.com/
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);

    // Only allow POST /api/chat
    if (request.method !== "POST" || url.pathname !== "/api/chat") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Parse the incoming request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Validate required fields
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Forward to Groq API with server-side API key
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model || "llama3-8b-8192",
        messages: body.messages,
        max_tokens: body.max_tokens || 150,
        temperature: body.temperature || 0.7,
        stream: false,
      }),
    });

    const data = await groqResponse.json();

    return new Response(JSON.stringify(data), {
      status: groqResponse.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    });
  },
};
