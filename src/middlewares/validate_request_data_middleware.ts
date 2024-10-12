import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects, ZodDiscriminatedUnion } from 'zod';

import { HttpReponses, Logger } from '../utils';

export type RequestValidationType = 'body' | 'params' | 'query';

export const ValidateRequestData =
  (
    schema:
      | AnyZodObject
      | ZodEffects<AnyZodObject>
      | ZodDiscriminatedUnion<string, AnyZodObject[]>,
    type: RequestValidationType = 'body'
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // We do n0t want Zod to throw errors when validation fails. `safeParse`
    // returns an object containing either the successfully parsed data
    // or a ZodError instance containing detailed information about
    // the validation problems.
    const validationResult = await schema.safeParseAsync(req[type]);

    if (!validationResult.success) {
      // Logger.error(validationResult.error.issues);

      const error = validationResult.error.issues.reduce((acc, issue) => {
        /**
         * issue.path is an array of strings of the form ['email'], ['password']
         * etc. We want to convert this to an object with the field name as
         * the key and the error message as the value so that it is easy
         * to access the error message for each field.
         *
         *  Example:
         *  error = { email: 'error message', password: 'error message' }
         */
        const key =
          issue.path.length > 1 ? issue.path.join('.') : issue.path[0];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        acc[key] = issue.message;

        return acc;
      }, {}) as Record<string, string>;

      return HttpReponses.unprocessableEntity(res, error);
    }

    req[type] = validationResult.data;

    return next();
  };
