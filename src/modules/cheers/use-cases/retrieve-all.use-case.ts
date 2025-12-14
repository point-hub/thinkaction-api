import { BaseUseCase, type IQuery, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IRetrieveOutput } from '../repositories/retrieve.repository';
import type { IRetrieveAllRepository } from '../repositories/retrieve-all.repository';

export interface IInput {
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
  my_cheered_id: string
}

/**
 * Use case: Retrieve a paginated list of all cheers.
 *
 * Responsibilities:
 * 1. Retrieve cheer data and pagination information from the repository using the provided query.
 * 2. Return a standardized success response containing the cheer list and pagination details.
 */
export class RetrieveAllUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve cheer data and pagination information from the repository.
    const response = await this.deps.retrieveAllRepository.handle(input.query);
    // 2. Return a standardized success response containing the cheer list and pagination details.
    return this.success({
      data: response.data,
      pagination: response.pagination,
      my_cheered_id: response.my_cheered_id,
    });
  }
}
