import express from "express";
import { setupAuth } from "./auth-setup.ts";
import configRoutes from "./routes/index.ts"

const server = express()
  .use(express.json());

configRoutes(server);
setupAuth(server);

// Supplied by outermost environment file
const port: number = Number(process.env["BACKEND_PORT"]!);

server.listen(port, () => {
  console.log("Server active!");
  console.log(`Routes running on http://localhost:${port}`)
});