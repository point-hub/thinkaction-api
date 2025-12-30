import { type IController, type IControllerInput } from '@point-hub/papi';

import { TokenService } from '../utils/jwt';

export const refreshController: IController = async (controllerInput: IControllerInput) => {
  controllerInput.res.status(200);
  const accessToken = TokenService.createAccessToken(controllerInput.req['user']?._id as string);
  controllerInput.res.cookie('thinkaction_access', accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years
  });

  const refreshToken = TokenService.createRefreshToken(controllerInput.req['user']?._id as string);
  controllerInput.res.cookie('thinkaction_refresh', refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years
  });
  controllerInput.res.json({
    ...controllerInput.req['user'],
    access_token: accessToken,
    refresh_token: refreshToken,
  });
};
