import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUniqueValidation } from '@/utils/unique-validation';

import type { IUserEntity } from '../interface';
import type { IUpdateRepository } from '../repositories/update.repository';
import type { IPasswordService } from '../utils/password';

export interface IInput {
  filter: {
    _id: string
  }
  auth: IUserEntity,
  data: {
    current_password: string
    password: string
  }
}

export interface IDeps {
  updateRepository: IUpdateRepository
  uniqueValidation: IUniqueValidation
  passwordService: IPasswordService
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update a user's password.
 *
 * Responsibilities:
 * 1. Verify current password using the password service.
 * 2. Hash the new password using the password service.
 * 3. Create a user entity containing the hashed password.
 * 4. Update the user's password record in the repository.
 * 5. Return standardized success response.
 */
export class UpdatePasswordUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Verify current password using the password service.
    if (!await this.deps.passwordService.verify(input.data.current_password, input.auth.password as string)) {
      return this.fail({
        code: 422,
        message: 'Invalid password',
        errors: {
          current_password: ['Invalid Password'],
        },
      });
    }

    // 2. Hash the new password using the password service.
    const hashedPassword = await this.deps.passwordService.hash(input.data.password);

    // 4. Update the user's password record in the repository.
    const response = await this.deps.updateRepository.handle(input.filter._id, {
      password: hashedPassword,
      request_password: undefined,
    });

    // 5. Return standardized success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
