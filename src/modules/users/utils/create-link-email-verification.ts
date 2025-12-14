import { tokenGenerate } from '@point-hub/express-utils';

import apiConfig from '@/config/api';

export interface ICreateLinkEmailVerification {
  (): { code: string, url: string }
}

export const createLinkEmailVerification = () => {
  return {
    code: tokenGenerate(),
    url: `${apiConfig.clientUrl}/verify-email`,
  };
};
