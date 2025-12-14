import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import { UserEntity } from '../entity';
import type { IIsEmailExistsRepository } from '../repositories/is-email-exists.repository';

export interface IInput {
  data: {
    email: string
  }
}

export interface IDeps {
  isEmailExistsRepository: IIsEmailExistsRepository
}

export interface ISuccessData {
  exists: boolean
}

/**
 * Use case: Check if an email address already exists.
 *
 * Responsibilities:
 * 1. Create a UserEntity and normalize the provided email.
 * 2. Query the repository to check if the email exists in the database.
 * 3. Return a standardized success response containing the existence result.
 */
export class IsEmailExistsUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Create a UserEntity and normalize the provided email.
    const userEntity = new UserEntity({ email: input.data.email });
    userEntity.trimmedEmail();

    // 2. Query the repository to check if the email exists in the database.
    const response = await this.deps.isEmailExistsRepository.handle(userEntity.data.trimmed_email as string);

    // 3. Return a standardized success response containing the existence result.
    return this.success({ exists: response });
  }
}
