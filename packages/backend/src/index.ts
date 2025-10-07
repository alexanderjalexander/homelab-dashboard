import fastify from "fastify";
import fastify_jwt from "@fastify/jwt"
import fastify_leveldb from "@fastify/leveldb"
import fastify_auth from "@fastify/auth"
import routes from "./routes/index.ts"

const server = fastify();

server.register(fastify_jwt, { secret: process.env["JWT_SECRET"]! });
server.register(fastify_leveldb, { name: 'authdb', path: '.authdb', options: {} });
server.register(fastify_auth);

server.register(routes);

const port:number = Number(process.env["BACKEND_PORT"]!);
delete(process.env["ADMIN_USERNAME"]);
delete(process.env["ADMIN_PASSWORD"]);

server.listen({ port: port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});