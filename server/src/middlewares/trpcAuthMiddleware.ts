import { type Request, type Response } from 'express';
import {middleware, publicProcedure} from '../trpc/index'
import { validateAccessToken } from './auth0Middleware';


const validateAccessTokenMiddleware = middleware(async ({ ctx, next }) => {
  const { req, res } = ctx;

  if (!req || !res) {
    throw new Error('Request and response objects are required in the context.');
  }

  await new Promise<void>((resolve, reject) => {
    validateAccessToken(req as Request, res as Response, (err?: unknown) => {
      if (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      } else {
        resolve();
      }
    });
  });

  return next();
});
export const auth0Procedure = publicProcedure.use(validateAccessTokenMiddleware);
