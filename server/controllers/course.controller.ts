import { redis } from "../utils/redis";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";

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
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
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
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
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
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
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
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);

// get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      const courseExists = userCourseList?.find(
        (course: any) => course._id.toString() === courseId,
      );

      if (!courseExists) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 400),
        );
      }

      const course = await CourseModel.findById(courseId);
      const content = course?.courseData;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);

// add question in course
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId),
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      // create a new question object
      //TODO: if possible change any Types for here
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      // add this question to our course content
      courseContent.questions.push(newQuestion);

      // create notification when quetion is added
      await NotificationModel.create({
        user: req.user?._id,
        title: "New Question Received",
        message: `You have new question in ${courseContent.title}`,
      });

      // save the updated course
      await course?.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);

// add answer in course quetion
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId),
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      // create a new question object
      const question = courseContent?.questions?.find((item: any) =>
        item._id.equals(questionId),
      );

      if (!question) {
        return next(new ErrorHandler("Invalid question id", 400));
      }

      // create a new answer object
      const newAnswer: any = {
        user: req.user,
        answer,
      };

      // add replie answer to our course content
      // Ensure questionReplies exists and create if not
      if (!question.questionReplies) {
        question.questionReplies = [];
      }
      question.questionReplies.push(newAnswer);

      await course?.save();

      if (req.user?._id === question.user?._id) {
        // create notification when answer is added
        await NotificationModel.create({
          user: req.user?._id,
          title: "New Answer Received",
          message: `You have new answer in ${courseContent.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent.title,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data,
        );

        await sendMail({
          email: question.user.email,
          subject: "Question Reply",
          template: "question-reply.ejs",
          data,
        });
      }
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);

// add review in course
interface IAddReviewData {
  review: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      // check if courseId already exists in userCourseList based on _id
      const courseExists = userCourseList?.some(
        (course: any) => course._id.toString() === courseId.toString(),
      );
      if (!courseExists) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 404),
        );
      }

      const course = await CourseModel.findById(courseId);
      const { review, rating } = req.body as IAddReviewData;

      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };
      course?.reviews.push(reviewData);
      let avg = 0;

      course?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });

      if (course) {
        course.ratings = avg / course.reviews.length;
      }

      await course?.save();

      const notification = {
        title: "New Review Received",
        message: `${req.user?.name} has left a review in ${course?.name}`,
      };

      // create notification
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);

// add replay in review
interface IAddReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewData;

      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const review = course.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId,
      );

      if (!review) {
        return next(new ErrorHandler("Review not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies.push(replyData);
      await course.save();

      return res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);

// Get all Coures --only for admin
export const getAllUsers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);

// delete course --only for admin
export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);
      if (!course) {
        return next(new ErrorHandler("Course not found", 400));
      }
      await course.deleteOne({ id });
      await redis.del(id);
      res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      return next(
        error instanceof Error ? new ErrorHandler(error.message, 400) : error,
      );
    }
  },
);
