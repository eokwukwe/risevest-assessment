export class HttpError extends Error {
  status: boolean;
  isOperational: boolean;

  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.status = false;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}