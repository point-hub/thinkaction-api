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

const toBoolean = (value: unknown): boolean => {
  if (value === true || value === false) return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return false; // default
};

export class RetrieveAllRepository implements IRetrieveAllRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(query: IQuery): Promise<IRetrieveAllOutput> {
    // TODO: this is temporary fix because @point-hub/papi not convert boolean correctly
    if (query['filter.is_read']) {
      query['filter.is_read'] = toBoolean(query['filter.is_read']);
    }

    if (!query['filter.type']) {
      query['filter.type'] = { $ne: 'system' };
    }

    const pipeline: IPipeline[] = [];

    pipeline.push(...this.pipeRecipient());
    pipeline.push(...this.pipeActor());
    pipeline.push(...this.pipeFinalProjection());

    const response = await this.database.collection(collectionName).aggregate(pipeline, query, this.options);

    return {
      data: response.data as unknown as IRetrieveOutput[],
      pagination: response.pagination,
    };
  }

  private pipeRecipient(): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'recipient_id',
          foreignField: '_id',
          as: 'recipient',
        },
      },
      {
        $unwind: {
          path: '$recipient',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  private pipeActor(): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'actor_id',
          foreignField: '_id',
          as: 'actor',
        },
      },
      {
        $unwind: {
          path: '$actor',
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
          type: 1,
          message: 1,
          is_read: 1,
          entities: 1,
          thumbnail_url: 1,
          created_at: 1,
          actor: {
            _id: 1,
            name: 1,
            username: 1,
            email: 1,
            profile: 1,
            avatar: 1,
          },
          recipient: {
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
