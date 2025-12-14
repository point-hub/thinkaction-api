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
  supporting: {
    name: string
    supportname: string
    email: string
    is_email_verified: boolean
    profile: {
      status: string
      bio: string
    }
    avatar: {
      public_domain: string
      public_path: string
    }
  }
  supporter: {
    name: string
    supportname: string
    email: string
    is_email_verified: boolean
    profile: {
      status: string
      bio: string
    }
    avatar: {
      public_domain: string
      public_path: string
    }
  }
  created_at: Date
}

/**
 * Use case: Retrieve a single support's details.
 *
 * Responsibilities:
 * 1. Retrieve support data from the repository using the provided unique identifier (`_id`).
 * 2. Return a standardized success response containing the support's full details.
 */
export class RetrieveUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve support data from the repository using the provided unique identifier.
    const response = await this.deps.retrieveRepository.handle(input._id);

    // 2. Return a standardized success response containing the support's full details.
    return this.success({
      _id: response._id,
      supporting: response.supporting,
      supporter: response.supporter,
      created_at: response.created_at,
    });
  }
}
