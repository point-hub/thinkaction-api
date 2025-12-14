import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IRetrieveAllRepository } from '../repositories/retrieve-all.repository';
import type { IVerifyEmailRepository } from '../repositories/verify-email.repository';

export interface IInput {
  code: string
}

export interface IDeps {
  verifyEmailRepository: IVerifyEmailRepository
  retrieveAllRepository: IRetrieveAllRepository
}

export interface ISuccessData {
  email: string
  matched_count: number
  modified_count: number
}

/**
 * Use case: Verify a user's email address.
 *
 * Responsibilities:
 * 1. Retrieve the user associated with the provided verification code.
 * 2. Validate that the verification code is valid and corresponds to an existing user.
 *    2.1. Reject the request if no user is found for the provided verification code.
 * 3. Mark the user's email as verified in the repository.
 * 4. Return a standardized success response.
 */
export class VerifyEmailUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve the user associated with the provided verification code.
    const userResponse = await this.deps.retrieveAllRepository.handle({
      filter: { 'email_verification.code': input.code },
    });

    // 2. Validate that the verification code is valid and corresponds to an existing user.
    // 2.1. Reject the request if no user is found for the provided verification code.
    if (userResponse.data.length === 0) {
      return this.fail({
        code: 422,
        message: 'Verification code is invalid',
        errors: {
          code: ['Verification code is invalid'],
        },
      });
    }

    // 3. Mark the user's email as verified in the repository.
    const response = await this.deps.verifyEmailRepository.handle(userResponse.data[0]._id, {
      email_verification: {
        is_verified: true,
        verified_at: new Date(),
        requested_at: null,
        code: null,
        url: null,
      },
    });

    // 4. Return a standardized success response.
    return this.success({
      email: userResponse.data[0].email,
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
