import fastify from "fastify";
import routes from "./routes/index.ts"

const server = fastify();

server.register(routes)

const port:number = Number(process.env["BACKEND_PORT"]!);

server.listen({ port: port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});