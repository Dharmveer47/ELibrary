import { Request, NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { IReqBody } from "./types/conroller";
import bcrypt from "bcrypt";
import userModal from "./userModal";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const createUser = async (
  req: Request<object, object, IReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, name, password } = req.body;

  // Validation
  if (!email || !name || !password) {
    const error = createHttpError(400, "All fields are required8");
    return next(error);
  }

  // data base check user exits or not
  const user = await userModal.findOne({ email });

  if (user) {
    const error = createHttpError(409, "User already exists");
    return next(error);
  }

  // password hashing
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await userModal.create({
    name,
    email,
    password: hashPassword,
  });

  // Token generation JWT
  // second param we can pass algorithm
  const token = sign(
    {
      id: newUser._id,
    },
    config.jwtSecret as string,
    { expiresIn: "7d" }
  );

  // Response 

  res.json({
    message: "User created successfully",
    access_token: token,
  });
};

export { createUser };
