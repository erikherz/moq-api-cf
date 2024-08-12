export class Origins {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request, env, options) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const namespace = pathname.split("/")[2];

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    console.log(`Request method: ${request.method}, namespace: ${namespace}`);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (request.method === "POST") {
        console.log('Routing to handlePost...');
        return await this.handlePost(request, namespace, corsHeaders);
      } else if (request.method === "GET") {
        console.log('Routing to handleGet...');
        return await this.handleGet(request, namespace, corsHeaders);
      } else if (request.method === "DELETE") {
        console.log('Routing to handleDelete...');
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
      const edgeParam = new URL(request.url).searchParams.get('edge');
      let data = await this.state.storage.get(namespace);

      if (!data) {
        return new Response(JSON.stringify({ error: "Namespace not found" }), { status: 404, headers: corsHeaders });
      }

      let jsonData = JSON.parse(data);

      if (edgeParam && jsonData.url) {
        jsonData.url = `https://${edgeParam}`;
      }

      return new Response(JSON.stringify(jsonData), { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error("Error in handleGet:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
    }
  }

  async handleDelete(namespace, corsHeaders) {
    console.log(`handleDelete called for namespace: ${namespace}`);
    try {
      await this.state.storage.delete(namespace);
      console.log(`Namespace ${namespace} successfully deleted.`);
      const responseContent = { message: "Origin removed" };
      return new Response(JSON.stringify(responseContent), { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error("Error in handleDelete:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
    }
  }
}
