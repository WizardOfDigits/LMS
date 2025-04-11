import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { generatorLast12MonthsData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import OrderModel from "../models/order.model";

// get user analytics -- only for admin
export const getUserAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generatorLast12MonthsData(userModel);
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);

// get courses analytics -- only for admin
export const getCoursesAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await generatorLast12MonthsData(CourseModel);
      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);

// get order analytics -- only for admin
export const getOrdersAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await generatorLast12MonthsData(OrderModel);
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);
