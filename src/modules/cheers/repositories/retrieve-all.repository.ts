import type { IDatabase, IPagination, IPipeline, IQuery } from '@point-hub/papi';

import { collectionName } from '../entity';
import { type IRetrieveOutput } from './retrieve.repository';

export interface IRetrieveAllRepository {
  handle(query: IQuery): Promise<IRetrieveAllOutput>
}

export interface IRetrieveAllOutput {
  data: IRetrieveOutput[]
  pagination: IPagination
  my_cheered_id: string
}

export class RetrieveAllRepository implements IRetrieveAllRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(query: IQuery): Promise<IRetrieveAllOutput> {
    const pipeline:IPipeline[] = [];

    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $project: {
        '_id': 1,
        'created_at': 1,
        'user': {
          '_id': 1,
          'name': 1,
          'username': 1,
          'email': 1,
          'profile': 1,
          'avatar': 1,
        },
      },
    });

    const response = await this.database.collection(collectionName).aggregate(pipeline, query, this.options);

    // Check if current user-goal pair exists
    const my_cheered_id = await this.findMyCheeredId(query);

    return {
      my_cheered_id: my_cheered_id,
      data: response.data as unknown as IRetrieveOutput[],
      pagination: response.pagination,
    };
  }

  private async findMyCheeredId(query: IQuery): Promise<string> {
    const userId = query?.['user_id'];
    const goalId = query?.['goal_id'];

    if (!userId || !goalId) {
      return '';
    }

    const exists = await this.database
      .collection(collectionName)
      .retrieveAll({
        filter: {
          user_id: query?.['user_id'],
          goal_id: goalId,
        },
      });

    if (exists.data.length === 0) {
      return '';
    }

    return exists.data[0]._id;
  }
}
