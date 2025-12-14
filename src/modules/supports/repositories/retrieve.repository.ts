import type { IDatabase, IPipeline } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IRetrieveRepository {
  handle(_id: string): Promise<IRetrieveOutput>
}

export interface IRetrieveOutput {
  _id: string
  supporting: {
    _id: string
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
    _id: string
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

export class RetrieveRepository implements IRetrieveRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string): Promise<IRetrieveOutput> {
    const pipeline: IPipeline[] = [];
    pipeline.push({ $match: { _id } });
    pipeline.push(...this.pipeSupporter());
    pipeline.push(...this.pipeSupporting());
    pipeline.push(...this.pipeFinalProjection());

    const response = await this.database
      .collection(collectionName)
      .aggregate(pipeline, { }, this.options);

    return response.data[0] as unknown as IRetrieveOutput;
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
