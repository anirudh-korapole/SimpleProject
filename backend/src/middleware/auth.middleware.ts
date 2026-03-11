import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticateAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
