import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { IBook } from "./types/book";
import path from "node:path";
import fs from "node:fs";
import { catchError } from "../utils/basicError";
import createHttpError from "http-errors";
import bookModel from "./bookModel";

const createBook = async (
  req: Request<object, object, IBook>,
  res: Response,
  next: NextFunction
) => {
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

  const bookFileUploadResult = async () =>
    await cloudinary.uploader.upload(booKFilePath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "books",
      format: "pdf",
    });

  const [_error, _uploadCoverResult] = await catchError(uploadResult());
  if (_error) {
    return next(createHttpError(500, `error while uploading ${_error}`));
  }

  const [_errorPdf, _uploadPdfResult] = await catchError(
    bookFileUploadResult()
  );
  if (_errorPdf) {
    return next(createHttpError(500, `error while uploading pdf ${_errorPdf}`));
  }

  const newBook = await bookModel.create({
    title: req.body.title,
    author: "671d2ca2175008467148571f",
    coverImage: _uploadCoverResult?.secure_url,
    description: req.body.description,
    genre: req.body.genre,
    file: _uploadPdfResult?.secure_url,
  });

  // delete temp file
  const [coverUnlinkError] = await catchError(fs.promises.unlink(filePath));

  if (coverUnlinkError) {
    return next(
      createHttpError(500, `error while unlinking cover ${coverUnlinkError}`)
    );
  }
  const [pdfUnlinkError] = await catchError(fs.promises.unlink(booKFilePath));

  if (pdfUnlinkError) {
    return next(
      createHttpError(500, `error while unlinking pdf ${pdfUnlinkError}`)
    );
  }
  // @ts-ignore
  console.log("userID", req.userId); 
  res.status(201).json({ newBook, id: newBook._id });
};

export { createBook };
