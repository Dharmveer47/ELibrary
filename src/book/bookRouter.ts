import express from "express";
import { createBook } from "./bookController";
import multer from "multer";
import path from "node:path";

const bookRouter = express.Router();

// file store local -> 
const upload = multer({
    dest: path.resolve(__dirname, '../../public/data/uploads'),
    limits: {
        
    }
});


//routes

bookRouter.post("/", createBook);

export default bookRouter;
