import type { IController, IControllerInput } from '@point-hub/papi';

import { sendEmail } from '@/utils/email';
import { schemaValidation } from '@/utils/validation';

import { IdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import { UpdateRepository } from '../repositories/update.repository';
import { requestPasswordRules } from '../rules/request-password.rules';
import { RequestPasswordUseCase } from '../use-cases/request-password.use-case';
import { createLinkResetPassword } from '../utils/create-link-reset-password';

export const requestPasswordController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    await schemaValidation(controllerInput.req['body'], requestPasswordRules);

    // Initialize repositories and utilities
    const identityMatcherRepository = new IdentityMatcherRepository(controllerInput.dbConnection, { session });
    const updateRepository = new UpdateRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const requestPasswordUseCase = new RequestPasswordUseCase({
      identityMatcherRepository,
      updateRepository,
      sendEmail,
      createLinkResetPassword,
    });

    // Execute business logic
    const response = await requestPasswordUseCase.handle({
      data: {
        email: controllerInput.req['body']['email'],
      },
    });

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
    controllerInput.res.json();
  } catch (error) {
    await session?.abortTransaction();
    throw error;
  } finally {
    await session?.endSession();
  }
};
