import type { IController, IControllerInput } from '@point-hub/papi';

import { UniqueValidation } from '@/utils/unique-validation';
import { schemaValidation } from '@/utils/validation';

import { ResetPasswordRepository } from '../repositories/reset-password.repository';
import { RetrieveAllRepository } from '../repositories/retrieve-all.repository';
import { resetPasswordRules } from '../rules/reset-password.rules';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import { PasswordService } from '../utils/password';

export const resetPasswordController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    await schemaValidation(controllerInput.req['body'], resetPasswordRules);

    // Initialize repositories and utilities
    const resetPasswordRepository = new ResetPasswordRepository(controllerInput.dbConnection, { session });
    const retrieveAllRepository = new RetrieveAllRepository(controllerInput.dbConnection, { session });
    const uniqueValidation = new UniqueValidation(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const resetPasswordUseCase = new ResetPasswordUseCase({
      retrieveAllRepository,
      resetPasswordRepository,
      uniqueValidation,
      passwordService: PasswordService,
    });

    // Execute business logic
    const response = await resetPasswordUseCase.handle({
      filter: { code: controllerInput.req['body'].code },
      data: { password: controllerInput.req['body'].password },
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
    controllerInput.res.json(response.data);
  } catch (error) {
    await session?.abortTransaction();
    throw error;
  } finally {
    await session?.endSession();
  }
};
