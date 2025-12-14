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
  goal_id: string
  parent_id: string
  comment: string
  created_by_id: string
  created_at: Date
  updated_at: Date
}

/**
 * Use case: Retrieve a single comment's details.
 *
 * Responsibilities:
 * 1. Retrieve comment data from the repository using the provided unique identifier (`_id`).
 * 2. Return a standardized success response containing the comment's full details.
 */
export class RetrieveUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve comment data from the repository using the provided unique identifier.
    const response = await this.deps.retrieveRepository.handle(input._id);

    // 2. Return a standardized success response containing the comment's full details.
    return this.success({
      _id: response._id,
      goal_id: response.goal_id,
      parent_id: response.parent_id,
      comment: response.comment,
      created_by_id: response.created_by_id,
      created_at: response.created_at,
      updated_at: response.updated_at,
    });
  }
}
