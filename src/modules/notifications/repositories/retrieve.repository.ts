import type { IDatabase, IPipeline } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IRetrieveRepository {
  handle(_id: string): Promise<IRetrieveOutput>
}

export interface IActor {
  _id: string
  name: string
  username: string
  email: string
  profile: string
  avatar: string
}

export interface IRecipient {
  _id: string
  name: string
  username: string
  email: string
  profile: string
  avatar: string
}

export interface IRetrieveOutput {
  _id: string
  type: string
  message: string
  is_read: string
  entity: string
  created_at: string
  actor: IActor
  recipient: IRecipient
}

export class RetrieveRepository implements IRetrieveRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(_id: string): Promise<IRetrieveOutput> {
    const pipeline: IPipeline[] = [];

    pipeline.push(...this.pipeRecipient());
    pipeline.push(...this.pipeActor());
    pipeline.push(...this.pipeFinalProjection());

    const response = await this.database.collection(collectionName).aggregate(pipeline, { filter: { _id } }, this.options);

    return {
      _id: response.data[0]['_id'] as string,
      type: response.data[0]['type'] as string,
      message: response.data[0]['message'] as string,
      is_read: response.data[0]['is_read'] as string,
      entity: response.data[0]['entity'] as string,
      created_at: response.data[0]['created_at'] as string,
      actor: response.data[0]['actor'] as IActor,
      recipient: response.data[0]['recipient'] as IRecipient,
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
          entity: 1,
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
