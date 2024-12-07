import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { IBook } from "./types/book";
import path from "node:path";
import { catchError } from "../utils/basicError";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const coverImageMineType = files.coverImage[0].mimetype.split("/").at(-1);
  const fileName = files.coverImage[0].filename;
  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );

  const uploadResult = async () =>
    await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMineType,
    });

  const bookFileName = files.file[0].filename;
  const booKFilePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    bookFileName
  );
  const [_error, _uploadResult] = await catchError(uploadResult());

  if (_error) {
    return next(createHttpError(500, `error while uploading ${_error}`));
  }

  const bookFileUploadResult = await cloudinary.uploader.upload(booKFilePath, {
    resource_type: "raw",
    filename_override: bookFileName,
    folder: "books",
    format: "pdf",
  });

  console.log("this_is_upload_result", bookFileUploadResult);

  res.json({ message: "Create Book" });
};

export { createBook };
