import { Router } from 'express';

import type { IBaseAppInput } from '@/app';
import { makeController, makeMiddleware } from '@/express';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { authOptionalMiddleware } from '@/middlewares/auth-optional.middleware';
import type { IRoute } from '@/router';

import * as controller from './controllers/index';

const makeRouter = async ({ dbConnection }: IBaseAppInput) => {
  const router = Router();

  const routes: IRoute[] = [
    { method: 'post', path: '/', middlewares: [authMiddleware], controller: controller.createController },
    { method: 'get', path: '/', middlewares: [authOptionalMiddleware], controller: controller.retrieveAllController },
    { method: 'get', path: '/progress', controller: controller.retrieveAllProgressController },
    { method: 'get', path: '/:id', middlewares: [authOptionalMiddleware], controller: controller.retrieveController },
    { method: 'post', path: '/:id/progress', middlewares: [authMiddleware], controller: controller.createProgressController },
    { method: 'patch', path: '/:id', middlewares: [authMiddleware], controller: controller.updateController },
    { method: 'delete', path: '/:id', middlewares: [authMiddleware], controller: controller.deleteController },
  ];

  routes.forEach(({ method, path, controller, middlewares }) => {
    const middlewareFns = middlewares?.map((middleware) => makeMiddleware({ middleware, dbConnection })) ?? [];
    router[method](path, ...middlewareFns, makeController({ controller, dbConnection }));
  });

  return router;
};

export default makeRouter;
