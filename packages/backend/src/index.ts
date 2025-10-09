import express from "express";
import configRoutes from "./routes/index.ts";
import { setupAuth } from "./auth-setup.ts";

const server = express()
  .use(express.json);

configRoutes(server);
setupAuth(server);

// Supplied by outermost environment file
const port: number = Number(process.env["BACKEND_PORT"]!);

server.listen(port, () => {
  console.log("Server active!");
  console.log(`Routes running on http://localhost:${port}`)
});

/* import fastify from "fastify";
import { setupAuth } from "./auth-helpers.ts";
import routes from "./routes/index.ts"

const server = fastify({});

// Add JSON Content Parsing
server.addContentTypeParser('application/json', { parseAs: 'string' }, function (_req, body, done) {
  try {
    const json = JSON.parse(body.toString())
    done(null, json)
  } catch (err) {
    // @ts-ignore
    err.statusCode = 400
    // @ts-ignore
    done(err, undefined)
  }
})

// Plugins setup
console.log("Setting up Authentication...");
await setupAuth(server);
console.log("Authentication set up!");

// Register all other routes
server.register(routes);

const port: number = Number(process.env["BACKEND_PORT"]!);

server.listen({ port: port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
*/