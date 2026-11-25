import { createServer } from "node:http";
import "./env.js";

const { default: app } = await import("../../src/app.js");

export async function startApp() {
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return { server, url: `http://127.0.0.1:${port}` };
}

export async function closeApp(server) {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

export async function request(path, options) {
  const running = await startApp();
  try {
    return await fetch(`${running.url}${path}`, options);
  } finally {
    await closeApp(running.server);
  }
}

export function jsonOptions(method, body, token) {
  return {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  };
}
