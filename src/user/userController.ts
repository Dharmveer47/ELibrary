import { Request, NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { IReqBody } from "./types/controller";
import bcrypt from "bcrypt";
import userModal from "./userModal";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { catchError } from "../utils/basicError";

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
  const [findError, user] = await catchError(userModal.findOne({ email }));
  if (user) {
    const error = createHttpError(409, "User already exists");
    return next(error);
  }
  if (findError) {
    return next(createHttpError(500, `error while finding ${findError}`));
  }

  const [hasError, hashPassword] = await catchError(bcrypt.hash(password, 10));
  const newUser = await userModal.create({
    name,
    email,
    password: hashPassword,
  });
  if (hasError) {
    return next(
      createHttpError(500, `error while hashing password ${hasError}`)
    );
  }

  try {
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

    res.status(201).json({
      message: "User created successfully",
      access_token: token,
    });
  } catch (error) {
    return next(`error while creating token ${error}`);
  }
};

const loginUser = async (
  req: Request<object, object, IReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  const [findError, user] = await catchError(userModal.findOne({ email }));

  if (!user) {
    const error = createHttpError(404, "User not found");
    return next(error);
  }

  if (findError) {
    return next(createHttpError(500, `error while finding ${findError}`));
  }

  const [compareError, comparePassword] = await catchError(
    bcrypt.compare(password, user.password)
  );

  if (!comparePassword) {
    const error = createHttpError(401, "Invalid credentials");
    return next(error);
  }

  if (compareError) {
    return next(createHttpError(500, `error while comparing ${compareError}`));
  }

  try {
    // Token generation JWT
    // second param we can pass algorithm
    const token = sign(
      {
        id: user._id,
      },
      config.jwtSecret as string,
      { expiresIn: "7d" }
    );

    // Response

    res.json({
      message: "User logged in successfully",
      access_token: token,
      data: { name: user.name, email: user.email },
    });
  } catch (error) {
    return next(`error while creating token ${error}`);
  }
};

export { createUser, loginUser };