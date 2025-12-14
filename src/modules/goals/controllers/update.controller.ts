import type { IController, IControllerInput } from '@point-hub/papi';

import { schemaValidation } from '@/utils/validation';

import { UpdateRepository } from '../repositories/update.repository';
import { updateRules } from '../rules/update.rules';
import { UpdateUseCase } from '../use-cases/update.use-case';

export const updateController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    await schemaValidation(controllerInput.req['body'], updateRules);

    // Initialize repositories and utilities
    const updateRepository = new UpdateRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const updateUseCase = new UpdateUseCase({
      updateRepository,
    });

    // Execute business logic
    const response = await updateUseCase.handle({
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
