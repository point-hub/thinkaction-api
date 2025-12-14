import { BaseUseCase, type ISchemaValidation, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUniqueValidation } from '@/utils/unique-validation';

import { UserEntity } from '../entity';
import type { IUpdateRepository } from '../repositories/update.repository';

export interface IInput {
  filter: {
    _id: string
  }
  data: {
    email?: string
  }
}

export interface IDeps {
  schemaValidation: ISchemaValidation
  updateRepository: IUpdateRepository
  uniqueValidation: IUniqueValidation
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update a user's email address.
 *
 * Responsibilities:
 * 1. Create a user entity with the new email and reset verification flag.
 * 2. Normalize the email for consistent formatting.
 * 3. Validate email uniqueness across all users.
 * 4. Update the user's email record in the repository.
 * 5. Return standardized success response.
 */
export class UpdateEmailUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Create a user entity with the new email and reset verification flag.
    const userEntity = new UserEntity({
      email: input.data.email,
      email_verification: {},
    });

    // 2. Normalize the email for consistent formatting.
    userEntity.trimmedEmail();

    // 3. Validate email uniqueness across all users.
    await this.deps.uniqueValidation.handle(
      'users',
      {
        match: { trimmed_email: input.data.email },
        replaceErrorAttribute: { trimmed_email: 'email' },
      },
      input.filter._id,
    );

    // 4. Update the user's email record in the repository.
    const response = await this.deps.updateRepository.handle(input.filter._id, userEntity.data);

    // 5. Return standardized success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
