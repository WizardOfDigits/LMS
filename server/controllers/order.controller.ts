import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendMail";
import OrderModel, { IOrder } from "../models/order.model";
import CourseModel from "../models/course.model";
import userModel from "../models/user.model";
import NotificationModel from "../models/notification.model";
import path from "path";
import ejs from "ejs";
import { newOrder } from "../services/order.service";

// create order
export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;
      const user = await userModel.findById(req.user?._id);
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("course not found", 400));
      }
      if (
        user?.courses.some((course) => course.courseId.toString() === courseId)
      ) {
        return next(new ErrorHandler("Already purchased", 400));
      }

      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info,
      };

      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData },
      );
      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error) {
        return next(
          error instanceof Error ? new ErrorHandler(error.message, 400) : error,
        );
      }

      if (course && user) {
        user.courses.push({ courseId: course._id });
        await user.save();
      }
      await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${course?.name}`,
      });
      course.purchaseCount = (course.purchaseCount ?? 0) + 1;
      await course.save();
      console.log(course.purchaseCount);
      newOrder(data, res, next);
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);
