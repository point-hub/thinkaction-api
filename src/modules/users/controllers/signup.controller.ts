import type { IController, IControllerInput } from '@point-hub/papi';

import { sendEmail } from '@/utils/email';
import { UniqueValidation } from '@/utils/unique-validation';
import { schemaValidation } from '@/utils/validation';

import { RetrieveRepository } from '../repositories/retrieve.repository';
import { SignupRepository } from '../repositories/signup.repository';
import { signupRules } from '../rules/signup.rules';
import { SignupUseCase } from '../use-cases/signup.use-case';
import { createLinkEmailVerification } from '../utils/create-link-email-verification';
import { PasswordService } from '../utils/password';

export const signupController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    await schemaValidation(controllerInput.req['body'], signupRules);

    // Initialize repositories and utilities
    const signupRepository = new SignupRepository(controllerInput.dbConnection, { session });
    const retrieveRepository = new RetrieveRepository(controllerInput.dbConnection, { session });
    const uniqueValidation = new UniqueValidation(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const signupUseCase = new SignupUseCase({
      signupRepository,
      retrieveRepository,
      uniqueValidation,
      sendEmail,
      createLinkEmailVerification,
      passwordService: PasswordService,
    });

    // Execute business logic
    const response = await signupUseCase.handle({ data: controllerInput.req['body'] });

    // Handle failed response
    if (response.status === 'failed') {
      controllerInput.res.status(response.error.code);
      controllerInput.res.statusMessage = response.error.message;
      controllerInput.res.json(response.error);
      return;
    }

    // Commit transaction and send response
    await session.commitTransaction();
    controllerInput.res.status(201);
    controllerInput.res.json(response.data);
  } catch (error) {
    await session?.abortTransaction();
    throw error;
  } finally {
    await session?.endSession();
  }
};
