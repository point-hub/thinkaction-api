import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUniqueValidation } from '@/utils/unique-validation';

import { UserEntity } from '../entity';
import type { IUpdateRepository } from '../repositories/update.repository';

export interface IInput {
  filter: {
    _id?: string
  }
  data: {
    name?: string
    profile?: {
      status?: string
      bio?: string
    }
    avatar?: {
      public_domain?: string
      public_path?: string
    }
    private_account?: boolean
  }
}

export interface IDeps {
  updateRepository: IUpdateRepository
  uniqueValidation: IUniqueValidation
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update user profile information.
 *
 * Responsibilities:
 * 1. Build a UserEntity and normalize relevant fields.
 * 2. Update the user record in the repository.
 * 3. Return standardized success response.
 */
export class UpdateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Build a UserEntity and normalize relevant fields.
    const userEntity = new UserEntity({
      name: input.data.name,
      profile: {
        status: input.data.profile?.status,
        bio: input.data.profile?.bio,
      },
      avatar: {
        public_domain: input.data.avatar?.public_domain,
        public_path: input.data.avatar?.public_path,
      },
      private_account: input.data.private_account,
    });

    // 2. Update the user record in the repository.
    const response = await this.deps.updateRepository.handle(input.filter._id ?? '', userEntity.data);

    // 3. Return standardized success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
