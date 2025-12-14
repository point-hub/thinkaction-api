import type { IController, IControllerInput } from '@point-hub/papi';

import { UniqueValidation } from '@/utils/unique-validation';
import { schemaValidation } from '@/utils/validation';

import type { IUserEntity } from '../interface';
import { UpdateRepository } from '../repositories/update.repository';
import { updatePasswordRules } from '../rules/update-password.rules';
import { UpdatePasswordUseCase } from '../use-cases/update-password.use-case';
import { PasswordService } from '../utils/password';

export const updatePasswordController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    await schemaValidation(controllerInput.req['body'], updatePasswordRules);

    // Initialize repositories and utilities
    const updateRepository = new UpdateRepository(controllerInput.dbConnection, { session });
    const uniqueValidation = new UniqueValidation(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const updatePasswordUseCase = new UpdatePasswordUseCase({
      updateRepository,
      uniqueValidation,
      passwordService: PasswordService,
    });

    // Execute business logic
    const response = await updatePasswordUseCase.handle({
      filter: { _id: controllerInput.req['params']['id'] },
      auth: controllerInput.req['user'] as IUserEntity,
      data: controllerInput.req['body'],
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
