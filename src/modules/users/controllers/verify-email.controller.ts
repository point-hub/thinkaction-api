import { type IController, type IControllerInput } from '@point-hub/papi';

import { schemaValidation } from '@/utils/validation';

import { RetrieveAllRepository } from '../repositories/retrieve-all.repository';
import { UserVerifyEmailRepository } from '../repositories/verify-email.repository';
import { verifyEmailRules } from '../rules/verify-email.rules';
import { VerifyEmailUseCase } from '../use-cases/verify-email.use-case';

export const verifyEmailController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    await schemaValidation(controllerInput.req['body'], verifyEmailRules);

    // Initialize repositories and utilities
    const verifyEmailRepository = new UserVerifyEmailRepository(controllerInput.dbConnection, { session });
    const retrieveAllRepository = new RetrieveAllRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const verifyEmailUseCase = new VerifyEmailUseCase({
      verifyEmailRepository,
      retrieveAllRepository,
    });

    // Execute business logic
    const response = await verifyEmailUseCase.handle(controllerInput.req['body']);

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
