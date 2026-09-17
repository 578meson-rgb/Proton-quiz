import app from "../server";
import type { Request, Response } from "express";

export default function handler(req: Request, res: Response) {
  // If Vercel rewrote /api/... to /api, restore the full path so Express routes match
  if (req.headers["x-matched-path"]) {
    req.url = req.headers["x-matched-path"] as string;
  }
  return app(req, res);
}

