import { type IController, type IControllerInput } from '@point-hub/papi';

export const signoutController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Initialize repositories and utilities

    // Execute business logic

    // Commit transaction and send response
    await session.commitTransaction();
    controllerInput.res.status(200);
    controllerInput.res.cookie('thinkaction_access', '', {
      secure: true, httpOnly: true, sameSite: 'lax', expires: new Date(0),
    });
    controllerInput.res.cookie('thinkaction_refresh', '', {
      secure: true, httpOnly: true, sameSite: 'lax', expires: new Date(0),
    });
    controllerInput.res.json();
  } catch (error) {
    await session?.abortTransaction();
    throw error;
  } finally {
    await session?.endSession();
  }
};
