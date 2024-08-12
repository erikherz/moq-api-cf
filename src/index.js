import { Origins } from './origins';

export { Origins };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const namespace = url.pathname.split("/")[2];

    // Log the hostname from the 'Host' header
    const hostHeader = request.headers.get("host");
    console.log(`Request received from host: ${hostHeader}`);

    const id = env.ORIGINS.idFromName(namespace);
    const obj = env.ORIGINS.get(id);

    return obj.fetch(request, env);
  }
};
