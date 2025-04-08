import express from "express";
import {
  activateUser,
  registrationUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserInfo,
  socialAuth,
  updateUserInfo,
  updatePassword,
  updateProfileAvatar,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

// Register a new user
userRouter.post("/register", registrationUser);

// Activate user account (typically via email verification token)
userRouter.post("/activate-user", activateUser);

// Log in an existing user
userRouter.post("/login", loginUser);

// Handle social login (Google, Facebook, etc.)
userRouter.post("/socialAuth", socialAuth);

// Log out the current authenticated user
userRouter.post("/logout", isAuthenticated, logoutUser);

// Refresh access token using a refresh token (usually stored in cookies)
userRouter.get("/refresh", updateAccessToken);

// Get the authenticated user's profile/info
userRouter.get("/info", isAuthenticated, getUserInfo);

// Update the authenticated user's profile info (e.g., name, email)
userRouter.put("/update-user-info", isAuthenticated, updateUserInfo);

// Change the authenticated user's password
userRouter.put("/update-user-password", isAuthenticated, updatePassword);

// Upload or change user's profile avatar
userRouter.put("/update-user-avatar", isAuthenticated, updateProfileAvatar);

// Get a list of all users (admin-only route)
userRouter.get(
  "/get-users",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllUsers,
);

// Admin route to change a user's role (e.g., user → admin)
userRouter.put(
  "/update-user-role",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserRole,
);

// Admin route to delete a specific user by ID
userRouter.delete(
  "/delete-user/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUser,
);
export default userRouter;
