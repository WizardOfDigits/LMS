import { NextFunction, Request, Response } from "express";

export const CatchAsyncError = (thisfunc: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(thisfunc(req, res, next)).catch(next);
  };
};
