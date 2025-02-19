import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";

// Register user
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, avatar } = req.body;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }

      const user: IRegistrationBody = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;

      const data = { user: { name: user.name }, activationCode };

      // Render email template
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"), // Ensure correct path here
        data,
      );
      // Send email logic here
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      });
      res.status(201).json({
        success: true,
        message:
          "Please check your email:${user.email} to activate your account",
        activationToken: activationToken.token,
      });
    } catch (error) {
      if (error instanceof Error) {
        return next(new ErrorHandler(error.message, 400)); // Properly typed error
      }
      return next(new ErrorHandler("Something went wrong", 500)); // Fallback if error isn't an instance of Error
    }
  },
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

// Create activation token
export const createActivationToken = (
  user: IRegistrationBody,
): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString(); // Generate activation code
  const token = jwt.sign(
    { user, activationCode }, // Include activationCode in the token payload
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" },
  );

  return { token, activationCode };
};
