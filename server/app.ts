require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";

export const app = express();

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors (cross origin resource sharing)
app.use(
  cors({
    origin: process.env.ORIGIN,
  }),
);

// routes
app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);

// testing API
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Running successfully",
  });
});

// unknown route
interface CustomError extends Error {
  statusCode?: number;
}

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err: CustomError = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

app.use(errorMiddleware);
