import type { FastifyInstance, FastifyPluginOptions, FastifyRegisterOptions, FastifyServerOptions } from "fastify";

async function routes (
    fastify:FastifyInstance,
    _options:FastifyRegisterOptions<FastifyPluginOptions>|undefined
) {
    fastify.get("/", async (_request, _reply) => {
        return "Hello World!\n";
    });
}

export default routes;