import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { IBook } from "./types/book";

const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  

  console.log(req.files, "req_file");
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const coverImageMineType = files.coverImage[0].mimetype;

  // const uploadResult = await cloudinary.uploader.upload(filePath, {
  //   filename_override: fileName,
  //   folder: "book-covers",
  //   format: coverImageMineType
  // })

  res.json({ message: "Create Book" });
};

export { createBook };
