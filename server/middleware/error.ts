import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, any>;
  path?: string;
}

export default (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode ?? 500;
  err.message = err.message || "Internal Server Error";

  // Wrong MongoDB ID error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error (MongoDB)
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue!)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again`;
    err = new ErrorHandler(message, 400);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = `Json web token is expired. Try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode ?? 500).json({
    success: false,
    message: err.message,
  });
};
