import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUserEntity } from '@/modules/users/interface';

import { GoalEntity } from '../entity';
import type { ICreateRepository } from '../repositories/create.repository';

export interface IInput {
  user: IUserEntity
  data: {
    specific: string
    measurable: string
    achievable: string
    relevant: string
    time: Date
    thumbnail_url: string
    visibility: 'public' | 'private' | 'supporters'
  }
}

export interface IDeps {
  createRepository: ICreateRepository
}

export interface ISuccessData {
  inserted_id: string
}

/**
 * Use case: Handle goal creation.
 *
 * Responsibilities:
 * 1. Create a GoalEntity and apply necessary transformations.
 * 2. Persist the goal data into the repository.
 * 3. Return success response with the inserted ID.
 */
export class CreateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(
    input: IInput,
  ): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Create a GoalEntity and apply necessary transformations.
    const goalEntity = new GoalEntity({
      specific: input.data.specific,
      measurable: input.data.measurable,
      achievable: input.data.achievable,
      relevant: input.data.relevant,
      time: new Date(input.data.time),
      thumbnail_url: input.data.thumbnail_url,
      visibility: input.data.visibility,
      status: 'in-progress',
      created_by_id: input.user._id,
    });

    // 2. Persist the goal data into the repository.
    const responseCreate = await this.deps.createRepository.handle(goalEntity.data);

    // 3. Return success response with the inserted ID.
    return this.success({
      inserted_id: responseCreate.inserted_id,
    });
  }
}
