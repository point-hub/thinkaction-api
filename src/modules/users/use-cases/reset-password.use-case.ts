import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUniqueValidation } from '@/utils/unique-validation';

import type { IResetPasswordRepository } from '../repositories/reset-password.repository';
import type { IRetrieveAllRepository } from '../repositories/retrieve-all.repository';
import type { IPasswordService } from '../utils/password';

export interface IInput {
  filter: {
    code: string
  }
  data: {
    password: string
  }
}

export interface IDeps {
  retrieveAllRepository: IRetrieveAllRepository
  resetPasswordRepository: IResetPasswordRepository
  uniqueValidation: IUniqueValidation
  passwordService: IPasswordService
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Reset a user's password.
 *
 * Responsibilities:
 * 1. Retrieve the user associated with the reset password link.
 * 2. Validate that the reset link is valid and the user exists.
 *    2.1. Reject the request if no user is found for the link.
 * 3. Hash the new password securely.
 * 4. Update the user's password in the repository.
 * 5. Return a standardized success response.
 */
export class ResetPasswordUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve the user associated with the reset password link.
    const user = await this.deps.retrieveAllRepository.handle({
      filter: { 'request_password.code': input.filter.code },
    });

    // 2. Validate that the reset link is valid and the user exists.
    // 2.1. Reject the request if no user is found for the link.
    if (user.data.length === 0) {
      return this.fail({ code: 400, message: 'Reset password code is invalid' });
    }

    // 3. Hash the new password securely.
    const hashedPassword = await this.deps.passwordService.hash(input.data.password as string);

    // 4. Update the user's password in the repository.
    const response = await this.deps.resetPasswordRepository.handle(user.data[0]._id, {
      password: hashedPassword,
      request_password: null,
    });

    // 5. Return a standardized success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
