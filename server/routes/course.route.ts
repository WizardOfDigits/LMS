import express from "express";
import {
  uploadCourse,
  editCourse,
  getSingleCourse,
  getAllCourses,
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

export default courseRouter;
