import auth from "@fastify/auth";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import leveldb from "@fastify/leveldb";
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const cookie_name = "aj-homelab-cookie";
const cookie_expire = "60m";
const salt_rounds = 16;
const hash_algo = "bcrypt";

const hashPassword = async (inputPassword: string) => {
    return await Bun.password.hash(inputPassword, {
        algorithm: hash_algo,
        cost: salt_rounds
    });
};

const verifyPassword = async (app:FastifyInstance, inputClearPassword: string) => {
    const hashedPassword:string = await app.level.authdb.get("ADMIN_HASHEDPASSWORD");
    return await Bun.password.verify(inputClearPassword, hashedPassword, hash_algo);
};

export const verifyJwt = async (request:FastifyRequest, reply:FastifyReply) => {
    try {
        await request.jwtVerify({ onlyCookie: true });
    } catch(err) {
        reply.send(err);
    }
}

export async function setupAuth(app: FastifyInstance) {
    await app.register(auth);
    await app.register(cookie);
    await app.register(jwt, {
        secret: process.env["JWT_SECRET"]!,
        cookie: {
            cookieName: cookie_name,
            signed: true,
        },
        decode: { complete: true },
        sign: {
            iss: 'aj-homelab',
            expiresIn: cookie_expire
        },
        verify: {
            allowedIss: 'aj-homelab',
        }
    });
    await app.register(leveldb, { name: 'authdb', path: '.authdb', options: {} });
    await app.level.authdb.put("ADMIN_USERNAME", process.env["ADMIN_USERNAME"]);
    const hashed_pw = await hashPassword(process.env["ADMIN_PASSWORD"]!);
    await app.level.authdb.put("ADMIN_HASHEDPASSWORD", hashed_pw);

    app.post('/login', async (request:FastifyRequest, reply:FastifyReply) => {
        try {
            // @ts-ignore
            const { user, password } = request.body;
            if (!user || !password
                || typeof(user) !== 'string' || typeof(password) !== 'string'
                || user.trim().length < 1 || password.trim().length < 1) {
                reply.status(400).send({"error": "Must supply obj with {'user': '...', 'password': '...'}"})
            }
            const storedUser = await app.level.authdb.get("ADMIN_USERNAME");
            if (user !== storedUser) {
                reply.status(401).send({"error": "Could not log in with those credentials"});
            }
            if (!verifyPassword(app, password)) {
                reply.status(401).send({"error": "Could not log in with those credentials"})
            }

            const token = await reply.jwtSign({
                name: cookie_name
            }, {expiresIn: cookie_expire});

            reply
                .setCookie(cookie_name, token, {
                    secure: true,
                    httpOnly: true,
                    sameSite: true,
                })
                .code(200)
        } catch(err) {
            reply.send(err);
        }
    })

    delete (process.env["ADMIN_USERNAME"]);
    delete (process.env["ADMIN_PASSWORD"]);
    delete (process.env["JWT_SECRET"]);
}
