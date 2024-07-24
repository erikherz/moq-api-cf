export class Origins {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const namespace = url.pathname.split("/")[2];

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (!namespace) {
      return new Response(JSON.stringify({ error: "Invalid namespace in URL" }), { status: 400, headers: corsHeaders });
    }

    try {
      if (request.method === "POST") {
        return await this.handlePost(request, namespace, corsHeaders);
      } else if (request.method === "GET") {
        return await this.handleGet(namespace, corsHeaders);
      } else if (request.method === "DELETE") {
        return await this.handleDelete(namespace, corsHeaders);
      } else {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
      }
    } catch (error) {
      console.error("Exception in fetch:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
    }
  }

  async handlePost(request, namespace, corsHeaders) {
    try {
      const requestBody = await request.text();
      let data;
      try {
        data = JSON.parse(requestBody);
      } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: corsHeaders });
      }

      if (!data.url) {
        return new Response(JSON.stringify({ error: "Missing url field in request body" }), { status: 400, headers: corsHeaders });
      }

      await this.state.storage.put(namespace, JSON.stringify(data));

      const responseContent = { message: "Origin registered", url: data.url };
      return new Response(JSON.stringify(responseContent), { status: 200, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to read or parse body" }), { status: 500, headers: corsHeaders });
    }
  }

  async handleGet(namespace, corsHeaders) {
    try {
      const data = await this.state.storage.get(namespace);
      if (!data) {
        return new Response(JSON.stringify({ error: "Namespace not found" }), { status: 404, headers: corsHeaders });
      }
      return new Response(data, { status: 200, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
    }
  }

  async handleDelete(namespace, corsHeaders) {
    try {
      await this.state.storage.delete(namespace);
      const responseContent = { message: "Origin removed" };
      return new Response(JSON.stringify(responseContent), { status: 200, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
    }
  }
}
