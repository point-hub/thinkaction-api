import {
  BaseUseCase,
  type IUseCaseOutputFailed,
  type IUseCaseOutputSuccess,
} from '@point-hub/papi';

import { GoalEntity } from '../entity';
import type { IUpdateRepository } from '../repositories/update.repository';

export interface IInput {
  filter: {
    _id: string
  }
  data: {
    status?: 'achieved' | 'failed' | 'in-progress'
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
 * Use case: Update goal status.
 *
 * Responsibilities:
 * 1. Build a GoalEntity with updated status data.
 * 2. Persist the goal status update in the repository.
 * 3. Return standardized success response.
 */
export class UpdateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(
    input: IInput,
  ): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Build a GoalEntity with updated status data.
    const goalEntity = new GoalEntity({
      status: input.data.status,
    });

    // 2. Persist the goal status update in the repository.
    const response = await this.deps.updateRepository.handle(
      input.filter._id ?? '',
      goalEntity.data,
    );

    // 3. Return standardized success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
