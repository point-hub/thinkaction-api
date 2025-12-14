import {
  BaseUseCase,
  type IQuery,
  type IUseCaseOutputFailed,
  type IUseCaseOutputSuccess,
} from '@point-hub/papi';

import type { IUserEntity } from '@/modules/users/interface';

import type { IRetrieveOutput } from '../repositories/retrieve.repository';
import type { IRetrieveAllRepository } from '../repositories/retrieve-all.repository';

export interface IInput {
  user: IUserEntity | undefined
  query: IQuery
}

export interface IDeps {
  retrieveAllRepository: IRetrieveAllRepository
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
 * Use case: Retrieve a paginated list of goals.
 *
 * Responsibilities:
 * 1. Retrieve goal data and pagination information from the repository
 *    using the provided query and user context.
 * 2. Return a standardized success response containing the goal list
 *    and pagination details.
 */
export class RetrieveAllUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(
    input: IInput,
  ): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve goal data and pagination information from the repository using the provided query and user context.
    const response = await this.deps.retrieveAllRepository.handle({
      ...input.query,
      user: input.user,
    });

    // 2. Return a standardized success response containing the goal list and pagination details.
    return this.success({
      data: response.data,
      pagination: response.pagination,
    });
  }
}
