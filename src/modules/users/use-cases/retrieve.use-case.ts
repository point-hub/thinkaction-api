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
  name: string
  username: string
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
  private_account: boolean
  created_at: Date
  updated_at: Date
}

/**
 * Use case: Retrieve a single user's details.
 *
 * Responsibilities:
 * 1. Retrieve user data from the repository using the provided unique identifier (`_id`).
 * 2. Return a standardized success response containing the user's full details.
 */
export class RetrieveUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve user data from the repository using the provided unique identifier.
    const response = await this.deps.retrieveRepository.handle(input._id);

    // 2. Return a standardized success response containing the user's full details.
    return this.success({
      _id: response._id,
      name: response.name,
      username: response.username,
      email: response.email,
      is_email_verified: response.is_email_verified,
      profile: response.profile,
      avatar: response.avatar,
      private_account: response.private_account,
      created_at: response.created_at,
      updated_at: response.updated_at,
    });
  }
}
