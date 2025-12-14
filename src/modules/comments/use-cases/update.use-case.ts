import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUpdateRepository } from '../repositories/update.repository';

export interface IInput {
  filter: {
    _id: string
  }
  data: {
    comment: string
  }
}

export interface IDeps {
  updateRepository: IUpdateRepository
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update comment profile information.
 *
 * Responsibilities:
 * 1. Update the comment record in the repository.
 * 2. Return standardized success response.
 */
export class UpdateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Update the comment record in the repository.
    const response = await this.deps.updateRepository.handle(input.filter._id, {
      comment: input.data.comment,
    });

    // 2. Return standardized success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
