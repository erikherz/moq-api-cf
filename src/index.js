import { Origins } from './origins';

export { Origins };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const namespace = url.pathname.split("/")[2]; // Extract the namespace from the URL
    const id = env.ORIGINS.idFromName(namespace);
    const obj = env.ORIGINS.get(id);
    return obj.fetch(request);
  }
};
