import type { IDatabase, IPagination, IPipeline, IQuery } from '@point-hub/papi';

import { collectionName } from '../entity';
import { type IRetrieveOutput } from './retrieve.repository';

export interface IRetrieveAllRepository {
  handle(query: IQuery): Promise<IRetrieveAllOutput>
}

export interface IRetrieveAllOutput {
  data: IRetrieveOutput[]
  pagination: IPagination
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
        localField: 'created_by_id',
        foreignField: '_id',
        as: 'created_by',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$created_by',
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $project: {
        '_id': 1,
        'goal_id': 1,
        'comment': 1,
        'mentions': 1,
        'created_at': 1,
        'created_by': {
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

    return {
      data: response.data as unknown as IRetrieveOutput[],
      pagination: response.pagination,
    };
  }
}
