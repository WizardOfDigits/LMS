import { redis } from "../utils/redis";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";

// upload course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (error) {
      if (error instanceof Error) {
        return next(new ErrorHandler(error.message, 400));
      }
      return next(new ErrorHandler("An unknown error occurred", 500));
    }
  },
);

// edit course
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const courseId = req.params.id;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true },
      );
      res.status(201).json({ success: true, course });
    } catch (error) {
      if (error instanceof Error) {
        return next(new ErrorHandler(error.message, 400));
      }
      return next(new ErrorHandler("An unknown error occurred", 500));
    }
  },
);

// get single course -- without purchasing
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      // Check if the course data exists in Redis cache to reduce database queries
      const isRedisCachedExists = await redis.get(courseId);

      // Parse the cached course data from Redis and return the response
      if (isRedisCachedExists) {
        const course = JSON.parse(isRedisCachedExists);
        res.status(200).json({ success: true, course });
      } else {
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links",
        );

        // Store the fetched course data in Redis cache for faster future access
        await redis.set(courseId, JSON.stringify(course));
        res.status(200).json({ success: true, course });
      }
    } catch (error) {
      if (error instanceof Error) {
        return next(new ErrorHandler(error.message, 400));
      }
      return next(new ErrorHandler("An unknown error occurred", 500));
    }
  },
);

// get all courses --- without purchasing
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the course data exists in Redis cache to reduce database queries
      const isRedisCachedExists = await redis.get("getAllCourses");

      // Parse the cached course data from Redis and return the response
      if (isRedisCachedExists) {
        const courses = JSON.parse(isRedisCachedExists);
        res.status(200).json({ success: true, courses });
      } else {
        const courses = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links",
        );

        // Store the fetched course data in Redis cache for faster future access
        await redis.set("getAllCourses", JSON.stringify(courses));
        res.status(200).json({ success: true, courses });
      }
    } catch (error) {
      if (error instanceof Error) {
        return next(new ErrorHandler(error.message, 400));
      }
      return next(new ErrorHandler("An unknown error occurred", 500));
    }
  },
);
