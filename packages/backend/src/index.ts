import express from "express";
import { setupAuth } from "./auth-setup.ts";
import configRoutes from "./routes/index.ts"

const server = express()
  .use(express.json());

if (!process.env["ADMIN_USERNAME"] || !process.env["ADMIN_PASSWORD"]) {
  throw new Error(".env variables for ADMIN_USERNAME, & ADMIN_PASSWORD, must be set!")
}

configRoutes(server);
setupAuth(server);

const port: number = 4000;

server.listen(port, () => {
  console.log("Server active!");
  console.log(`Routes running on http://localhost:${port}`)
});