import type { IDatabase } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IRetrieveRepository {
  handle(_id: string): Promise<IRetrieveOutput>
}

export interface IRetrieveOutput {
  _id: string
  goal_id: string
  parent_id: string
  comment: string
  created_by_id: string
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

    return {
      _id: response?._id as string,
      goal_id: response?.['goal_id'] as string,
      parent_id: response?.['parent_id'] as string,
      comment: response?.['comment'] as string,
      created_by_id: response?.['created_by_id'] as string,
      created_at: response?.['created_at'] as Date,
      updated_at: response?.['updated_at'] as Date,
    };
  }
}
