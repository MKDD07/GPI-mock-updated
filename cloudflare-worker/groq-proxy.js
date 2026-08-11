export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Handle API Chat proxy
    if (request.method === "POST" && url.pathname === "/api/chat") {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      };

      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      if (!body.messages || !Array.isArray(body.messages)) {
        return new Response(JSON.stringify({ error: "messages array required" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const apiKey = env.GROQ_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "GROQ_API_KEY secret is not set in Cloudflare." }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: body.model || "llama-3.3-70b-versatile",
            messages: body.messages,
            max_tokens: body.max_tokens || 100,
            temperature: body.temperature || 0.7,
            stream: false,
          }),
        });

        const data = await groqResponse.json();

        return new Response(JSON.stringify(data), {
          status: groqResponse.status,
          headers: {
            ...corsHeaders,
            "Cache-Control": "no-store",
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to connect to Groq API: " + err.message }), {
          status: 502,
          headers: corsHeaders,
        });
      }
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 2. Fetch static assets from GitHub Raw repository
    let path = url.pathname;
    if (path === "/" || path === "") {
      path = "/index.html";
    }

    // Map content types based on file extension
    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
    };

    const dotIndex = path.lastIndexOf(".");
    const ext = dotIndex !== -1 ? path.substring(dotIndex).toLowerCase() : "";
    const contentType = contentTypes[ext] || "text/plain";

    // Github raw base URL (using main branch)
    const githubRawUrl = `https://raw.githubusercontent.com/MKDD07/GPI-mock-updated/main/docs${path}`;

    try {
      const response = await fetch(githubRawUrl);
      if (response.ok) {
        return new Response(response.body, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=0, must-revalidate",
          },
        });
      }
      return new Response("Asset not found on GitHub: " + path, { status: 404 });
    } catch (err) {
      return new Response("Error fetching asset: " + err.message, { status: 500 });
    }
  },
};
