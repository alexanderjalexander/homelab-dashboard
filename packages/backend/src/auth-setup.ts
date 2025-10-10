import session from "express-session";

import type { Express, Request, Response } from "express";
import usersData from "./data/users.ts"
import { users as usersCol } from "./config/mongoCollections.ts"
import { ObjectId } from "mongodb";
import { admin_hpw_key, admin_pw_key, admin_user_key } from "./helpers.ts";

declare module "express-session" {
  interface Session {
    user: {
        name: string,
        user_agent: string,
        from?: string,
        host?: string,
        authenticated: boolean,
    },
  }
}

export async function setupAuth(server: Express) {
    server.use(session({
        name: 'aj-homelab-server',
        secret: process.env["SECRET"]!,
        saveUninitialized: false,
        resave: false,
        cookie: {maxAge: 1000*60*30} /* 30 minute cookie age */
    }));

    try {
        await usersData.getUserByUsername(process.env[admin_user_key]!);
    } catch(_e) {
        if (process.env[admin_hpw_key] === undefined) {
            const newUser = await usersData.createUser(process.env[admin_user_key]!, process.env[admin_pw_key]!, true);
            process.env[admin_hpw_key] = newUser.hashedPassword;
            delete (process.env[admin_pw_key]);
        } else {
            const usersCollection = await usersCol();
            await usersCollection.findOneAndReplace(
                {"username": process.env[admin_user_key]!},
                {
                    _id: new ObjectId(),
                    username: process.env[admin_user_key]!,
                    hashedPassword: process.env[admin_hpw_key],
                    admin: true,
                },
            )
        }
    }

    const logIn = async (request:Request, response:Response) => {
        try {
            const { user, password } = request.body;
            if (!user
                || !password
                || typeof(user) !== 'string'
                || typeof(password) !== 'string'
                || user.trim().length < 1
                || password.trim().length < 1) {
                response.status(400).json({"error": "Must supply obj with {'user': '...', 'password': '...'}"});
            }
            let storedUser;
            try {
                storedUser = await usersData.loginUser(user, password);
            } catch(e) {
                response.status(401).json({"error": "Could not log in with those credentials"});
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
            response.status(400).json({error: err});
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
                        response.status(500).json({error: 'There was a problem logging out'});
                    } else {
                        response.sendStatus(200);
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
