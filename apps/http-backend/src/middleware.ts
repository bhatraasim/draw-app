import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECERT } from "@repo/backend-common"

export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization ?? "";

  try {
    const decoded = jwt.verify(token, JWT_SECERT) as { userId: string };

    req.userId = decoded.userId;
    next();
    
  } catch {
    return res.status(403).json({ message: "Unauthorized" });
  }
}
