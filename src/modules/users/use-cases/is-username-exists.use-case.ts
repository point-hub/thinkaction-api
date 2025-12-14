import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import { UserEntity } from '../entity';
import type { IIsUsernameExistsRepository } from '../repositories/is-username-exists.repository';

export interface IInput {
  data: {
    username: string
  }
}

export interface IDeps {
  isUsernameExistsRepository: IIsUsernameExistsRepository
}

export interface ISuccessData {
  exists: boolean
}

/**
 * Use case: Check if a username already exists.
 *
 * Responsibilities:
 * 1. Create a UserEntity and normalize the provided username.
 * 2. Query the repository to check if the username exists in the database.
 * 3. Return a standardized success response containing the existence result.
 */
export class IsUsernameExistsUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Create a UserEntity and normalize the provided username.
    const userEntity = new UserEntity({ username: input.data.username });
    userEntity.trimmedUsername();

    // 2. Query the repository to check if the username exists in the database.
    const response = await this.deps.isUsernameExistsRepository.handle(userEntity.data.trimmed_username as string);

    // 3. Return a standardized success response containing the existence result.
    return this.success({ exists: response });
  }
}
