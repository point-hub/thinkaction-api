import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IRetrieveRepository } from '../repositories/retrieve.repository';

export interface IInput {
  _id: string
}

export interface IDeps {
  retrieveRepository: IRetrieveRepository
}

export interface ISuccessData {
  _id: string
  created_at: Date
  updated_at: Date
}

/**
 * Use case: Retrieve a single goal's details.
 *
 * Responsibilities:
 * 1. Retrieve goal data from the repository using the provided unique identifier (`_id`).
 * 2. Return a standardized success response containing the goal's full details.
 */
export class RetrieveUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve goal data from the repository using the provided unique identifier.
    const response = await this.deps.retrieveRepository.handle(input._id);

    // 2. Return a standardized success response containing the goal's full details.
    return this.success({
      _id: response._id,
      created_at: response.created_at,
      updated_at: response.updated_at,
    });
  }
}
