import { onRequestGet, onRequestPost } from "./functions/api/board.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/board") {
      const context = { request, env, waitUntil: (task) => ctx.waitUntil(task) };
      if (request.method === "GET") return onRequestGet(context);
      if (request.method === "POST") return onRequestPost(context);
      return new Response(null, { status: 405 });
    }
    return env.ASSETS.fetch(request);
  },
};
