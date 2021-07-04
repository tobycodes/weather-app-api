import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).send({ message: "Please sign in first" });

  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET as string);
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(400).send({ message: "Invalid token provided" });
  }
};
