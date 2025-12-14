import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUserEntity } from '@/modules/users/interface';

import type { IUpdateManyRepository } from '../repositories/update-many.repository';

export interface IInput {
  user: IUserEntity
}

export interface IDeps {
  updateManyRepository: IUpdateManyRepository
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update notification profile information.
 *
 * Responsibilities:
 * 1. Update the notification record in the repository.
 * 2. Return standardized success response.
 */
export class UpdateReadUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Update the notification record in the repository.
    const response = await this.deps.updateManyRepository.handle({ recipient_id: input.user._id, is_read: false }, { is_read: true });

    // 2. Return standardized success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
