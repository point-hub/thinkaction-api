import {
  BaseUseCase,
  type IQuery,
  type IUseCaseOutputFailed,
  type IUseCaseOutputSuccess,
} from '@point-hub/papi';

import type { IUserEntity } from '@/modules/users/interface';

import type { IRetrieveOutput } from '../repositories/retrieve.repository';
import type { IRetrieveAllProgressRepository } from '../repositories/retrieve-all-progress.repository';

export interface IInput {
  user: IUserEntity | undefined
  query: IQuery
}

export interface IDeps {
  retrieveAllProgressRepository: IRetrieveAllProgressRepository
}

export interface ISuccessData {
  data: IRetrieveOutput[]
  pagination: {
    page: number
    page_count: number
    page_size: number
    total_document: number
  }
}

/**
 * Use case: Retrieve a paginated list of goal progress.
 *
 * Responsibilities:
 * 1. Retrieve progress data and pagination information from the repository
 *    using the provided query and user context.
 * 2. Return a standardized success response containing the progress list
 *    and pagination details.
 */
export class RetrieveAllProgressUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(
    input: IInput,
  ): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve progress data and pagination information from the repository using the provided query and user context.
    const response = await this.deps.retrieveAllProgressRepository.handle({
      ...input.query,
      user: input.user,
    });

    // 2. Return a standardized success response containing the progress list and pagination details.
    return this.success({
      data: response.data,
      pagination: response.pagination,
    });
  }
}
