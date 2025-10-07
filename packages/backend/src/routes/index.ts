import type { FastifyInstance, FastifyPluginOptions, FastifyRegisterOptions } from "fastify";

async function routes (
    fastify:FastifyInstance,
    _options:FastifyRegisterOptions<FastifyPluginOptions>|undefined
) {
    fastify.get("/", async (_request, _reply) => {
        return "Hello World!\n";
    });
    // fastify.after
}

export default routes;