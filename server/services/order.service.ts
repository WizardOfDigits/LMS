import { Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import OrderModel from "../models/order.model";

// create new order
export const newOrder = CatchAsyncError(
  async (data: any, res: Response, next: NextFunction) => {
    const order = await OrderModel.create(data);
    res.status(200).json({
      sucess: true,
      order,
    });
  },
);

// Get all orders
export const getAllOrdersService = async (res: Response) => {
  const orders = await OrderModel.find().sort({ createdAt: -1 });
  res.status(201).json({
    sucess: true,
    orders,
  });
};
