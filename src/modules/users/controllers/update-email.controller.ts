import type { IController, IControllerInput } from '@point-hub/papi';

import { UniqueValidation } from '@/utils/unique-validation';
import { schemaValidation } from '@/utils/validation';

import { UpdateRepository } from '../repositories/update.repository';
import { updateEmailRules } from '../rules/update-email.rules';
import { UpdateEmailUseCase } from '../use-cases/update-email.use-case';

export const updateEmailController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    await schemaValidation(controllerInput.req['body'], updateEmailRules);

    // Initialize repositories and utilities
    const updateRepository = new UpdateRepository(controllerInput.dbConnection, { session });
    const uniqueValidation = new UniqueValidation(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const updateEmailUseCase = new UpdateEmailUseCase({
      schemaValidation,
      updateRepository,
      uniqueValidation,
    });

    // Execute business logic
    const response = await updateEmailUseCase.handle({
      filter: { _id: controllerInput.req['params']['id'] },
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
