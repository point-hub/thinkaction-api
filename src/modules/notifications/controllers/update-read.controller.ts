import type { IController, IControllerInput } from '@point-hub/papi';

import type { IUserEntity } from '@/modules/users/interface';

import { UpdateManyRepository } from '../repositories/update-many.repository';
import { UpdateReadUseCase } from '../use-cases/update-read.use-case';

export const updateReadController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Initialize repositories and utilities
    const updateManyRepository = new UpdateManyRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const updateUseCase = new UpdateReadUseCase({
      updateManyRepository,
    });

    // Execute business logic
    const response = await updateUseCase.handle({
      user: controllerInput.req['user'] as IUserEntity,
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
