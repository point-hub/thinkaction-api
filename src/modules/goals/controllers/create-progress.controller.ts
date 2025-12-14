import type { IController, IControllerInput } from '@point-hub/papi';

import { schemaValidation } from '@/utils/validation';

import { UpdateRepository } from '../repositories/update.repository';
import { createProgressRules } from '../rules/create-progress.rules';
import { CreateProgressUseCase } from '../use-cases/create-progress.use-case';

export const createProgressController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    await schemaValidation(controllerInput.req['body'], createProgressRules);

    // Initialize repositories and utilities
    const updateRepository = new UpdateRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const createProgressUseCase = new CreateProgressUseCase({
      updateRepository,
    });

    // Execute business logic
    const response = await createProgressUseCase.handle({
      _id: controllerInput.req['params']['id'],
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
