import type { IDatabase, IPagination } from '@point-hub/papi';

import { collectionName } from '../entity';
import { type IRetrieveOutput } from './retrieve.repository';

export interface IIdentityMatcherRepository {
  handle(trimmed_username_or_email: string): Promise<IIdentityMatcherOutput>
}

export interface IIdentityMatcherOutput {
  data: IRetrieveOutput[]
  pagination: IPagination
}

export class IdentityMatcherRepository implements IIdentityMatcherRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(trimmed_username_or_email: string): Promise<IIdentityMatcherOutput> {
    const response = await this.database.collection(collectionName).retrieveAll(
      {
        filter: {
          $or: [
            { trimmed_username: { $eq: trimmed_username_or_email } },
            { trimmed_email: { $eq: trimmed_username_or_email } },
          ],
        },
      },
      this.options,
    );

    return {
      data: response.data as unknown as IRetrieveOutput[],
      pagination: response.pagination,
    };
  }
}
