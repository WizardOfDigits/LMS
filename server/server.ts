import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";
import connectDB from "./utils/db";

// create server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  connectDB();
});
