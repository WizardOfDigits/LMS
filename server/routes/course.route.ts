import express from "express";
import {
  uploadCourse,
  editCourse,
  getSingleCourse,
  getAllCourses,
  getCourseByUser,
  addQuestion,
  addAnswer,
  addReview,
  addReplyToReview,
  getAllUsers,
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const courseRouter = express.Router();

// create course
courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse,
);

//edit course
courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse,
);

//get single course
courseRouter.get("/get-course/:id", getSingleCourse);

// get all coursess
courseRouter.get("/get-courses/", getAllCourses);

// get course content
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser);

// add question in course
courseRouter.put("/add-question", isAuthenticated, addQuestion);

// send answer replay through mail
courseRouter.put("/add-answer", isAuthenticated, addAnswer);

// add Review
courseRouter.put("/add-review/:id", isAuthenticated, addReview);

// add replay to Review
courseRouter.put(
  "/add-replay-review",
  isAuthenticated,
  authorizeRoles("admin"),
  addReplyToReview,
);

// create course
courseRouter.put(
  "/get-courses",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllCourses,
);

export default courseRouter;
