import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IDeleteManyRepository as ICheersDeleteManyRepository } from '@/modules/cheers/repositories/delete-many.repository';
import type { IDeleteManyRepository as ICommentsDeleteManyRepository } from '@/modules/comments/repositories/delete-many.repository';
import type { IStorageService } from '@/modules/storages/utils/storage-service';

import type { IDeleteRepository } from '../repositories/delete.repository';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';

export interface IInput {
  _id: string
}

export interface IDeps {
  retrieveRepository: IRetrieveRepository
  deleteRepository: IDeleteRepository
  commentsDeleteManyRepository: ICommentsDeleteManyRepository
  cheersDeleteManyRepository: ICheersDeleteManyRepository
  storageService: IStorageService
}

export interface ISuccessData {
  deleted_count: number
}

/**
 * Use case: Delete goal.
 *
 * Responsibilities:
 * 1. Retrieve the goal data by ID.
 * 2. Delete the goal record from the repository.
 * 3. Delete the associated thumbnail from storage.
 * 4. Return standardized success response.
 */
export class DeleteUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(
    input: IInput,
  ): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve the goal data by ID.
    const goal = await this.deps.retrieveRepository.handle(input._id);

    // 2. Delete the goal record from the repository.
    const response = await this.deps.deleteRepository.handle(input._id);
    this.deps.commentsDeleteManyRepository.handle({ goal_id: goal._id });
    this.deps.cheersDeleteManyRepository.handle({ goal_id: goal._id });

    // 3. Delete the associated thumbnail from storage.
    this.deps.storageService.delete(goal.thumbnail_url.replace(this.deps.storageService.getPublicDomain(), ''));

    if (goal.progress) {
      for (const element of goal.progress) {
        this.deps.storageService.delete(element.media_url?.replace(this.deps.storageService.getPublicDomain(), ''));
        this.deps.storageService.delete(element.thumbnail_url?.replace(this.deps.storageService.getPublicDomain(), ''));
      }
    }

    // 4. Return standardized success response.
    return this.success({
      deleted_count: response.deleted_count,
    });
  }
}
