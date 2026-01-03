import type { IController, IControllerInput } from '@point-hub/papi';

import cookieConfig from '@/config/cookie';
import { schemaValidation } from '@/utils/validation';

import { IdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import { signinRules } from '../rules/signin.rules';
import { SigninUseCase } from '../use-cases/signin.use-case';
import { TokenService } from '../utils/jwt';
import { PasswordService } from '../utils/password';

export const signinController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    schemaValidation(controllerInput.req['body'], signinRules);

    // Initialize repositories and utilities
    const identityMatcherRepository = new IdentityMatcherRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const signinUseCase = new SigninUseCase({
      identityMatcherRepository,
      passwordService: PasswordService,
      tokenService: TokenService,
    });

    // Execute business logic
    const response = await signinUseCase.handle({ data: controllerInput.req['body'] });

    // Handle failed response
    if (response.status === 'failed') {
      controllerInput.res.status(response.error.code);
      controllerInput.res.statusMessage = response.error.message;
      controllerInput.res.json(response.error);
      return;
    }

    // Commit transaction and send response
    await session.commitTransaction();
    controllerInput.res.status(200);
    controllerInput.res.cookie('thinkaction_access', response.data.access_token, {
      domain: cookieConfig.domain === 'localhost' ? 'localhost' : `.${cookieConfig.domain}`,
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years
    });
    controllerInput.res.cookie('thinkaction_refresh', response.data.refresh_token, {
      domain: cookieConfig.domain === 'localhost' ? 'localhost' : `.${cookieConfig.domain}`,
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years
    });
    controllerInput.res.json(response.data);
  } catch (error) {
    await session?.abortTransaction();
    throw error;
  } finally {
    await session?.endSession();
  }
};
