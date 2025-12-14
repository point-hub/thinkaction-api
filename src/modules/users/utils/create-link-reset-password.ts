import { tokenGenerate } from '@point-hub/express-utils';

import apiConfig from '@/config/api';

export interface ICreateLinkResetPassword {
  (): { code: string, url: string }
}

export const createLinkResetPassword = () => {
  return {
    code: tokenGenerate(),
    url: `${apiConfig.clientUrl}/reset-password`,
  };
};
