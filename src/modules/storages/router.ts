import type { IController } from '@point-hub/papi';
import { Router } from 'express';

import { type IBaseAppInput } from '@/app';
import { makeController, makeMiddleware } from '@/express';
import { authMiddleware } from '@/middlewares/auth.middleware';

import * as controller from './controllers/index';

const makeRouter = async (routerInput: IBaseAppInput) => {
  const router = Router();

  const withAuth = makeMiddleware({
    middleware: authMiddleware,
    dbConnection: routerInput.dbConnection,
  });

  const useController = (controller: IController) => makeController({
    controller,
    dbConnection: routerInput.dbConnection,
  });

  router.post('/presign-avatar', withAuth, useController(controller.presignAvatarController));
  router.post('/presign-goal', withAuth, useController(controller.presignGoalController));
  router.post('/presign-progress', withAuth, useController(controller.presignProgressController));

  return router;
};

export default makeRouter;
