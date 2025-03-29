import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";

// isAuthicated user
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;

    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 401),
      );
    }
    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string,
    ) as JwtPayload;

    if (!decoded) {
      return next(
        new ErrorHandler("Please login to access this resource", 401),
      );
    }
    const user = await redis.get(decoded._id);
    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }
    req.user = JSON.parse(user);
    next();
  },
);

// validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allow to access this resource`,
          403,
        ),
      );
    }
    next();
  };
};
