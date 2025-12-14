import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUpdateLastSeenRepository } from '../repositories/update-last-seen.repository';

export interface IInput {
  filter: {
    _id?: string
  }
}

export interface IDeps {
  updateLastSeenRepository: IUpdateLastSeenRepository
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update user profile information.
 *
 * Responsibilities:
 * 1. Build a UserEntity and normalize relevant fields.
 * 2. Update the user record in the repository.
 * 3. Return standardized success response.
 */
export class UpdateLastSeenUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 2. Update the user record in the repository.
    const response = await this.deps.updateLastSeenRepository.handle(input.filter._id as string);

    // 3. Return standardized success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
