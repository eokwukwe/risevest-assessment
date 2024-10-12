import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export interface ResponsePayload {
  status: boolean;
  code: number;
  message?: string;
  data?: object;
  error?: object;
}

export class HttpReponses {
  static notFound(res: Response, message: string = 'Resource not found.') {
    return this.response(res, {
      status: false,
      code: StatusCodes.NOT_FOUND,
      message,
    });
  }

  static unAuthorized(res: Response, message: string = 'Unauthorized') {
    return this.response(res, {
      status: false,
      code: StatusCodes.UNAUTHORIZED,
      message,
    });
  }

  static unprocessableEntity(res: Response, error: object) {
    return this.response(res, {
      status: false,
      code: StatusCodes.UNPROCESSABLE_ENTITY,
      message: 'Validation Error.',
      error,
    });
  }

  static ok(res: Response, payload: { data?: object; message?: string }) {
    const content: ResponsePayload = {
      status: true,
      code: StatusCodes.OK,
    };

    if (payload.message) {
      content.message = payload.message;
    }

    if (payload.data) {
      content.data = payload.data;
    }

    return this.response(res, content);
  }

  static created(res: Response, data: object) {
    return this.response(res, {
      status: true,
      code: StatusCodes.CREATED,
      data,
    });
  }

  static serverError(res: Response, message: string = 'Server error.') {
    return this.response(res, {
      status: false,
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message,
    });
  }

  static response(res: Response, payload: ResponsePayload) {
    const resObject: Omit<ResponsePayload, 'code'> = {
      status: payload.status,
    };

    if (payload.message) {
      resObject.message = payload.message;
    }

    if (payload.error) {
      resObject.error = payload.error;
    }

    if (payload.data) {
      resObject.data = payload.data;
    }

    return res.status(payload.code).json(resObject);
  }
}
