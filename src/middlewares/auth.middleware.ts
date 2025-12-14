import type { IMiddleware, IMiddlewareInput } from '@point-hub/papi';

import { RetrieveRepository } from '@/modules/users/repositories/retrieve.repository';
import { TokenService } from '@/modules/users/utils/jwt';
import { throwApiError } from '@/utils/throw-api-error';

export const authMiddleware: IMiddleware = async (middlewareInput: IMiddlewareInput) => {
  const bearer = middlewareInput.req['headers']['authorization'];
  const signedCookie = middlewareInput.req['cookies']['thinkaction_access'];

  const token =
    bearer && bearer.startsWith('Bearer ')
      ? bearer.split(' ')[1]
      : signedCookie;

  if (!token) { throwApiError(401); }

  const decoded = TokenService.verifyToken(token);
  if (!decoded) { throwApiError(403); }

  const retrieveRepository = new RetrieveRepository(middlewareInput.dbConnection);
  const user = await retrieveRepository.handle((decoded as { sub: string }).sub);

  middlewareInput.req['user'] = user;
};
