import type { IDatabase } from '@point-hub/papi';

import { throwApiError } from '@/utils/throw-api-error';

import { collectionName } from '../entity';

export interface IRetrieveRepository {
  handle(_id: string): Promise<IRetrieveOutput>
}

export interface IRetrieveOutput {
  _id: string
  name: string
  username: string
  password: string
  email: string
  email_verification_code: string
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

export class RetrieveRepository implements IRetrieveRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(_id: string): Promise<IRetrieveOutput> {
    const response = await this.database.collection(collectionName).retrieve(_id, this.options);

    if (!response) {
      return throwApiError(404);
    }

    return {
      _id: response._id,
      name: response['name'] as string,
      username: response['username'] as string,
      password: response['password'] as string,
      email: response['email'] as string,
      email_verification_code: response['email_verification_code'] as string,
      is_email_verified: response['is_email_verified'] as boolean,
      profile: response['profile'] as {
        status: string
        bio: string
      },
      avatar: response['avatar'] as {
        public_domain: string
        public_path: string
      },
      private_account: response['private_account'] as boolean,
      created_at: response['created_at'] as Date,
      updated_at: response['updated_at'] as Date,
    };
  }
}
