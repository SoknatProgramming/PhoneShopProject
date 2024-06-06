import { Request, Response, NextFunction } from 'express';
import Error from '../interfaces/error.interface';

const errormMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = error.status || 500;
  const message = error.message || 'Opp something when wrong';
  res.status(status).json({ status, message });
};

export default errormMiddleware;
