import type { IController, IControllerInput } from '@point-hub/papi';

import { DeleteManyRepository as CheersDeleteManyRepository } from '@/modules/cheers/repositories/delete-many.repository';
import { DeleteManyRepository as CommentsDeleteManyRepository } from '@/modules/comments/repositories/delete-many.repository';
import { StorageService } from '@/modules/storages/utils/storage-service';
import { schemaValidation } from '@/utils/validation';

import { DeleteRepository } from '../repositories/delete.repository';
import { RetrieveRepository } from '../repositories/retrieve.repository';
import { updateRules } from '../rules/update.rules';
import { DeleteUseCase } from '../use-cases/delete.use-case';

export const deleteController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    await schemaValidation(controllerInput.req['body'], updateRules);

    // Initialize repositories and utilities
    const deleteRepository = new DeleteRepository(controllerInput.dbConnection, { session });
    const commentsDeleteManyRepository = new CommentsDeleteManyRepository(controllerInput.dbConnection, { session });
    const cheersDeleteManyRepository = new CheersDeleteManyRepository(controllerInput.dbConnection, { session });
    const retrieveRepository = new RetrieveRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const deleteUseCase = new DeleteUseCase({
      deleteRepository,
      commentsDeleteManyRepository,
      cheersDeleteManyRepository,
      retrieveRepository,
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
