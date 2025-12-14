import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';
import { randomUUIDv7 } from 'bun';

import type { IUpdateRepository } from '../repositories/update.repository';

export interface IInput {
  _id: string
  data: {
    goal_id: string
    caption: string
    media_url: string
    thumbnail_url: string
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
 * Use case: Create goal progress.
 *
 * Responsibilities:
 * 1. Build a progress payload.
 * 2. Prepend the progress entry to the goal progress list
 *    and persist the update via repository.
 * 3. Return standardized success response.
 */
export class CreateProgressUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(
    input: IInput,
  ): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Build a progress payload.
    const progress = {
      _id: randomUUIDv7(),
      goal_id: input.data.goal_id,
      caption: input.data.caption,
      media_url: input.data.media_url,
      thumbnail_url: input.data.thumbnail_url,
      created_at: new Date(),
    };

    // 2. Prepend the progress entry to the goal progress list and persist the update via repository.
    const response = await this.deps.updateRepository.handle(input._id ?? '', {
      progress: {
        $push: {
          $each: [progress],
          $position: 0,
        },
      },
    });

    // 3. Return standardized success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
