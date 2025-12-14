import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUserEntity } from '@/modules/users/interface';

import { CheerEntity } from '../entity';
import type { ICreateRepository } from '../repositories/create.repository';

export interface IInput {
  user: IUserEntity
  data: {
    goal_id: string
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
 * Use case: Handle cheer creation.
 *
 * Responsibilities:
 * 1. Create a CheerEntity and apply necessary transformations.
 * 2. Persist the cheer data into the repository.
 * 3. Return success response with the inserted ID.
 */
export class CreateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Create a CheerEntity and apply necessary transformations.
    const cheerEntity = new CheerEntity({
      goal_id: input.data.goal_id,
      created_by_id: input.user._id,
    });

    // 2. Persist the cheer data into the repository.
    const responseCreate = await this.deps.createRepository.handle(cheerEntity.data);

    // 3. Return success response with the inserted ID.
    return this.success({
      inserted_id: responseCreate.inserted_id,
    });
  }
}
