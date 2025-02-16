import dotenv from "dotenv";
dotenv.config();
import { Redis } from "ioredis";

const redisClient = () => {
  if (process.env.REDIS_URL) {
    console.log(`Redis connected`);
    return new Redis(process.env.REDIS_URL);
  }
  throw new Error("Redis connection failed");
};

export default redisClient;
