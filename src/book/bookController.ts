import { NextFunction, Request, Response } from "express";

const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const {} = req.body
    res.json({ message: "Create Book" });
};

export { createBook };
  