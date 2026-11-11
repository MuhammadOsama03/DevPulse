import type { Request, Response, NextFunction } from "express";

export function corsForOrigins(origins: readonly string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.header("Origin");
    if (origin && origins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS" && origin) {
      res.sendStatus(origins.includes(origin) ? 204 : 403);
      return;
    }
    next();
  };
}
