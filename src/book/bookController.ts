import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { IBook } from "./types/book";
import path from "node:path";
import fs from "node:fs";
import { catchError } from "../utils/basicError";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";
import mongoose from "mongoose";

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

  const _req = req as AuthRequest;
  const newBook = await bookModel.create({
    title: req.body.title,
    author: _req.userId,
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

  console.log("userID", _req.userId);
  res.status(201).json({ newBook, id: newBook._id });
};

interface IReqParam {
  bookId: string;
}
const updateBook = async (
  req: Request<object, object, IBook>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, genre } = req.body;
    const reqParam = req.params as IReqParam;
    const bookId = reqParam.bookId;

    // Validate the bookId
    if (!mongoose.isValidObjectId(bookId)) {
      throw createHttpError(400, "Invalid book ID");
    }

    const book = await bookModel.findById(bookId);

    if (!book) {
      throw createHttpError(404, "Book not found");
    }

    // Check access
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      throw createHttpError(403, "Unauthorized");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let completeCoverImage = book.coverImage; // Default to existing cover image
    let completeFileName = book.file; // Default to existing file
    const coverImageMineType = files.coverImage[0].mimetype.split("/").at(-1);
    // Handle cover image upload
    if (files?.coverImage?.[0]) {
      try {
        const fileName = files.coverImage[0].filename;
        const filePath = path.resolve(
          __dirname,
          "../../public/data/uploads/" + fileName
        );

        const uploadResult = await cloudinary.uploader.upload(filePath, {
          filename_override: fileName,
          folder: "book-covers",
          format: coverImageMineType,
        });

        completeCoverImage = uploadResult.secure_url;
        await fs.promises.unlink(filePath); // Remove the local file
      } catch (err) {
        console.error("Error uploading cover image:", err);
        throw createHttpError(500, "Failed to upload cover image");
      }
    }

    // Handle book file upload
    if (files?.file?.[0]) {
      try {
        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(
          __dirname,
          "../../public/data/uploads/" + bookFileName
        );

        const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
          resource_type: "raw",
          filename_override: bookFileName,
          folder: "books",
          format: "pdf",
        });

        completeFileName = uploadResultPdf.secure_url;
        await fs.promises.unlink(bookFilePath); // Remove the local file
      } catch (err) {
        console.error("Error uploading book file:", err);
        throw createHttpError(500, "Failed to upload book file");
      }
    }

    // Update the book document
    const updatedBook = await bookModel.findByIdAndUpdate(
      bookId,
      {
        title,
        description,
        genre,
        coverImage: completeCoverImage,
        file: completeFileName,
      },
      { new: true } // Return the updated document
    );

    if (!updatedBook) {
      throw createHttpError(500, "Failed to update book");
    }

    res.status(200).json({ updatedBook });
  } catch (error) {
    console.error("Error in updateBook function:", error);
    next(error);
  }
};
export { createBook, updateBook };
