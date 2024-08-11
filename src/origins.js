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

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Handle the database query normally
      let data = await this.state.storage.get(namespace);
      if (!data) {
        return new Response(JSON.stringify({ error: "Namespace not found" }), { status: 404, headers: corsHeaders });
      }
      
      let jsonData = JSON.parse(data);

      // Apply special handling if present
      if (options && options.specialHandling) {
        if (options.specialHandling.type === "edge") {
          jsonData.url = `https://${options.specialHandling.value}`;
        } else if (options.specialHandling.type === "regex") {
          const { contains, search, replace } = options.specialHandling;
          if (jsonData.url.includes(contains)) {
            const regex = new RegExp(search, 'g');
            jsonData.url = jsonData.url.replace(regex, replace);
          }
        }
      }

      return new Response(JSON.stringify(jsonData), { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error("Error in handleGet:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
    }
  }
}
