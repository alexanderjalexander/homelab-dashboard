import type { Express, Request, Response } from "express";

const constructorMethod = (server:Express) => {
  server.use('*', (_req:Request, res:Response) => {
    res.sendStatus(404);
  });
};

export default constructorMethod;