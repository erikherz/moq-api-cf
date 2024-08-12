export class Origins {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const namespace = pathname.split("/")[2];

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (request.method === "GET") {
        return this.handleGet(request, namespace, corsHeaders);
      } else if (request.method === "POST") {
        return this.handlePost(request, namespace, corsHeaders);
      } else if (request.method === "DELETE") {
        return this.handleDelete(namespace, corsHeaders);
      } else {
        return new Response(JSON.stringify({ error: "Unsupported method" }), { status: 405, headers: corsHeaders });
      }
    } catch (error) {
      console.error("Error in fetch:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
    }
  }

  async handlePost(request, namespace, corsHeaders) {
    console.log(`handlePost called with namespace: ${namespace}`);
    try {
      const requestBody = await request.text();
      console.log(`Request body: ${requestBody}`);
      let data;
      try {
        data = JSON.parse(requestBody);
      } catch (error) {
        console.error("Invalid JSON body:", error);
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: corsHeaders });
      }

      if (!data.url) {
        return new Response(JSON.stringify({ error: "Missing url field in request body" }), { status: 400, headers: corsHeaders });
      }

      await this.state.storage.put(namespace, JSON.stringify(data));
      console.log(`Namespace ${namespace} created with URL: ${data.url}`);

      const responseContent = { message: "Origin registered", url: data.url };
      return new Response(JSON.stringify(responseContent), { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error("Error in handlePost:", error);
      return new Response(JSON.stringify({ error: "Failed to read or parse body" }), { status: 500, headers: corsHeaders });
    }
  }

  async handleGet(request, namespace, corsHeaders) {
    try {
      let data = await this.state.storage.get(namespace);

      if (!data) {
        return new Response(JSON.stringify({ error: "Namespace not found" }), { status: 404, headers: corsHeaders });
      }

      let jsonData = JSON.parse(data);

      return new Response(JSON.stringify(jsonData), { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error("Error in handleGet:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
    }
  }

  async handleDelete(namespace, corsHeaders) {
    try {
      await this.state.storage.delete(namespace);
      const responseContent = { message: "Origin removed" };
      return new Response(JSON.stringify(responseContent), { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error("Error in handleDelete:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
    }
  }
}
