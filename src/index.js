import { Origins } from './origins';

export { Origins };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const fullPath = url.pathname;
    const namespace = fullPath.split("/")[2];

    // Log the hostname from the 'Host' header
    const hostHeader = request.headers.get("host");
    console.log(`Request received from host: ${hostHeader}`);

    // Detect /do_edge/ or /do_regex/ and pass them to the origin handler
    let specialHandling = null;
    if (fullPath.includes("/do_edge/")) {
      specialHandling = { type: "edge", value: fullPath.split("/do_edge/")[1] };
    } else if (fullPath.includes("/do_regex/")) {
      const parts = fullPath.split("/do_regex/")[1].split("/");
      specialHandling = { type: "regex", contains: parts[0], search: parts[1], replace: parts[2] };
    }

    const id = env.ORIGINS.idFromName(namespace);
    const obj = env.ORIGINS.get(id);

    // Pass special handling instructions with the request
    return obj.fetch(new Request(`${url.origin}${fullPath}`, request), { specialHandling });
  }
};
