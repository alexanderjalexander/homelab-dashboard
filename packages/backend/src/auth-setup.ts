// import cookie from "@fastify/cookie";
// import jwt from "@fastify/jwt";
// import leveldb from "@fastify/leveldb";
// import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import * as bcrypt from "bcrypt";
import session from "express-session";
import { MemoryLevel } from "memory-level";

import type { Express, Request, Response } from "express";

declare module "express-session" {
  interface Session {
    user: {
        name: string,
        user_agent: string,
        from: string,
        host: string,
        authenticated: boolean,
    },
  }
}

const salt_rounds = 12;
const admin_user_key = "ADMIN_USERNAME";
const admin_pw_key = "ADMIN_PASSWORD";
const admin_hpw_key = "ADMIN_HASHEDPASSWORD";

const hashPassword = async (inputPassword: string) => {
    return await bcrypt.hash(inputPassword, salt_rounds);
};

const verifyPassword = async (inputClearPassword:string, hashedPassword:string) => {
    return await bcrypt.compare(inputClearPassword, hashedPassword);
};

export async function setupAuth(server: Express) {
    server.use(session({
        name: 'aj-homelab-server',
        secret: process.env["SECRET"]!,
        saveUninitialized: false,
        resave: false,
        cookie: {maxAge: 1000*60*30} /* 30 minute cookie age */
    }));

    // TODO: Switch to MongoDB Implementation
    let memory_db;
    try {
        memory_db = new MemoryLevel({ valueEncoding: 'json', errorIfExists: true });
        server.set("memory_db", memory_db);
    } catch(_e) {
        memory_db = server.get("memory_db");
    }
    await memory_db.put(admin_user_key, process.env[admin_user_key]!);
    if (process.env[admin_hpw_key]) {
        await memory_db.put(admin_hpw_key, process.env[admin_hpw_key]!);
    } else {
        const hashed_pw = await hashPassword(process.env[admin_pw_key]!);
        await memory_db.put(admin_hpw_key, hashed_pw);
        process.env[admin_hpw_key] = hashed_pw
        delete (process.env[admin_pw_key])
    }


    const logIn = async (request:Request, response:Response) => {
        try {
            const { user, password } = request.body;
            if (!user || !password
                || typeof(user) !== 'string' || typeof(password) !== 'string'
                || user.trim().length < 1 || password.trim().length < 1) {
                response.status(400).send({"error": "Must supply obj with {'user': '...', 'password': '...'}"})
            }
            const storedUser = (await memory_db.get(admin_user_key))!;
            const storedPassword = (await memory_db.get(admin_hpw_key))!;
            if (user !== storedUser) {
                response.status(401).send({"error": "Could not log in with those credentials"});
            }
            if (!(await verifyPassword(password, storedPassword))) {
                response.status(401).send({"error": "Could not log in with those credentials"})
            }

            request.session.user = {
                name: user,
                user_agent: request.headers["user-agent"]!,
                from: request.headers["from"]!,
                host: request.headers["host"]!,
                authenticated: true,
            };
            response.status(200).json(request.session.user);
        } catch(err) {
            response.status(400).send(err);
        }
    }

    const checkAuth = async (request:Request, response:Response) => {
        try {
            if (request.session.user) {
                response.status(200).json(request.session.user);
            } else {
                response.status(401).json({error: "Not Logged In"});
            }
        } catch(err) {
            response.status(401).json({error: err});
        }
    }

    const logOut = async (request:Request, response:Response) => {
        try {
            if (request.session.user) {
                request.session.destroy((err) => {
                    if (err) {
                        console.error(err);
                        response.status(500).send('Error logging out');
                    } else {
                        response.send('Logged out');
                    }
                });
            } else {
                response.status(401).json({error: "Not Logged In"});
            }

        } catch(err) {
            response.status(500).json({error: err});
        }
    }

    server.post('/login', logIn);

    server.get("/check-auth", checkAuth);

    server.get("/logout", logOut);
}
