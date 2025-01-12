import { NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}

interface JwtPayload {
  id: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");

  if (!token) {
    return next(createHttpError(401, "Unauthorized"));
  }

  try {
    const parsedToken = token.split(" ").at(1) || "";
    const decoded = jwt.verify(
      parsedToken,
      config.jwtSecret as string
    ) as JwtPayload;

    const _req = req as AuthRequest;
    _req.userId = decoded.id as string;
    next();
  } catch (error) {
    return next(createHttpError(401, "token expired", { cause: error }));
  }
};

export default authenticate;
