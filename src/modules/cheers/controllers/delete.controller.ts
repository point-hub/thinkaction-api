import type { IController, IControllerInput } from '@point-hub/papi';

import { StorageService } from '@/modules/storages/utils/storage-service';

import { DeleteRepository } from '../repositories/delete.repository';
import { DeleteUseCase } from '../use-cases/delete.use-case';

export const deleteController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Initialize repositories and utilities
    const deleteRepository = new DeleteRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const deleteUseCase = new DeleteUseCase({
      deleteRepository,
      storageService: StorageService,
    });

    // Execute business logic
    const response = await deleteUseCase.handle({
      _id: controllerInput.req['params']['id'],
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
