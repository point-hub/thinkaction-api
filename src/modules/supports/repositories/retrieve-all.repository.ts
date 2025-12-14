import type { IDatabase, IPagination, IPipeline, IQuery } from '@point-hub/papi';

import { collectionName } from '../entity';
import type { IRetrieveOutput } from './retrieve.repository';

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
  ) {}

  async handle(query: IQuery): Promise<IRetrieveAllOutput> {
    const pipeline: IPipeline[] = [];

    pipeline.push(...this.pipeSupporter());
    pipeline.push(...this.pipeSupporting());
    pipeline.push(...this.pipeFinalProjection());

    const response = await this.database
      .collection(collectionName)
      .aggregate(pipeline, query, this.options);

    return {
      data: response.data as unknown as IRetrieveOutput[],
      pagination: response.pagination,
    };
  }

  private pipeSupporting(): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'supporting_id',
          foreignField: '_id',
          as: 'supporting',
        },
      },
      {
        $unwind: {
          path: '$supporting',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  private pipeSupporter(): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'supporter_id',
          foreignField: '_id',
          as: 'supporter',
        },
      },
      {
        $unwind: {
          path: '$supporter',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  private pipeFinalProjection(): IPipeline[] {
    return [
      {
        $project: {
          _id: 1,
          supporting: {
            _id: 1,
            name: 1,
            username: 1,
            email: 1,
            profile: 1,
            avatar: 1,
          },
          supporter: {
            _id: 1,
            name: 1,
            username: 1,
            email: 1,
            profile: 1,
            avatar: 1,
          },
        },
      },
    ];
  }
}
