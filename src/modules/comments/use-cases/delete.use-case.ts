import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IDeleteRepository } from '../repositories/delete.repository';

export interface IInput {
  _id: string
}

export interface IDeps {
  deleteRepository: IDeleteRepository
}

export interface ISuccessData {
  deleted_count: number
}

/**
 * Use case: Update comment profile information.
 *
 * Responsibilities:
 * 1. Update the comment record in the repository.
 * 2. Return standardized success response.
 */
export class DeleteUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Update the comment record in the repository.
    const response = await this.deps.deleteRepository.handle(input._id);

    // 2. Return standardized success response.
    return this.success({
      deleted_count: response.deleted_count,
    });
  }
}
