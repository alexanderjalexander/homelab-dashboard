// import cookie from "@fastify/cookie";
// import jwt from "@fastify/jwt";
// import leveldb from "@fastify/leveldb";
// import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import * as bcrypt from "bcrypt";
import session from "express-session";
import { MemoryLevel } from "memory-level";

import type { Express, Request, Response } from "express";

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

    let memory_db;
    try {
        memory_db = new MemoryLevel({ valueEncoding: 'json', errorIfExists: true });
        server.set("memory_db", memory_db);
    } catch(_e) {
        memory_db = server.get("memory_db");
    }
    await memory_db.put(admin_user_key, process.env[admin_user_key]!);
    const hashed_pw = await hashPassword(process.env[admin_pw_key]!);
    await memory_db.put(admin_hpw_key, hashed_pw);

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

            // TODO: Redo this
        } catch(err) {
            response.status(400).send(err);
        }
    }

    const checkAuth = async (_request:Request, response:Response) => {
        try {
            // TODO: Fix this
        } catch(err) {
            response.status(401).send(err);
        }
    }

    const logOut = async (_request:Request, response:Response) => {
        try {
            // TODO: Fix this
        } catch(err) {
            response.status(500).send(err);
        }
    }

    server.post('/login', logIn);

    server.get("/check-auth", checkAuth);

    server.get("/logout", logOut);

    delete (process.env[admin_user_key]);
    delete (process.env[admin_pw_key]);
    delete (process.env["SECRET"]);
}
