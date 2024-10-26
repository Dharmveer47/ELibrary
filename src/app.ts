import express, {  } from "express";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";


const app = express();

app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.use('/api/users',userRouter)


//Global error handler
// Route last

app.use(globalErrorHandler)

export default app;
