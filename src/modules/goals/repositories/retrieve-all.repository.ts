import { type IDatabase, type IPagination, type IPipeline, type IQuery } from '@point-hub/papi';

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

    pipeline.push(...this.pipeJoinCreatedByUser());
    pipeline.push(...this.pipeJoinSupporters(query));
    if (query['supporting_only']) {
      pipeline.push(...this.pipeFilterSupportingVisibility());
    } else {
      pipeline.push(...this.pipeFilterVisibility(query['user']?._id));
    }
    pipeline.push(...this.pipeJoinCheers());
    pipeline.push(...this.pipeAddCheerStats(query['user']?._id));
    pipeline.push(...this.pipeJoinComments());
    pipeline.push(...this.pipeFinalProjection());

    const response = await this.database.collection(collectionName).aggregate(pipeline, query, this.options);

    return {
      data: response.data as unknown as IRetrieveOutput[],
      pagination: response.pagination,
    };
  }

  private pipeJoinCreatedByUser(): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'created_by_id',
          foreignField: '_id',
          as: 'created_by',
        },
      },
      {
        $unwind: {
          path: '$created_by',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  private pipeJoinSupporters(query: IQuery): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'supports',
          let: {
            createdById: '$created_by_id',
            userId: query['user']?._id,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$supporter_id', '$$userId'] },
                    { $eq: ['$supporting_id', '$$createdById'] },
                  ],
                },
              },
            },
          ],
          as: 'my_support',
        },
      },
    ];
  }

  private pipeFilterSupportingVisibility(): IPipeline[] {
    const pipeline: IPipeline[] = [
      { $gt: [{ $size: '$my_support' }, 0] },
    ];

    return [
      {
        $match: {
          $expr: {
            $or: pipeline,
          },
        },
      },
    ];
  }

  private pipeFilterVisibility(user_id: string): IPipeline[] {
    const pipeline: IPipeline[] = [
      {
        $eq: ['$visibility', 'public'],
      },
      // visible to supporters
      {
        $and: [
          { $eq: ['$visibility', 'supporters'] },
          { $gt: [{ $size: '$my_support' }, 0] },
        ],
      },
      // visible to owner
      {
        $and: [
          { $eq: ['$visibility', 'supporters'] },
          { $eq: ['$created_by_id', user_id] },
        ],
      },
    ];

    if (user_id) {
      pipeline.push(
        {
          $and: [
            { $eq: ['$visibility', 'private'] },
            { $eq: ['$created_by_id', user_id] },
          ],
        },
      );
    }

    return [
      {
        $match: {
          $expr: {
            $or: pipeline,
          },
        },
      },
    ];
  }

  private pipeJoinCheers(): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'cheers',
          localField: '_id',
          foreignField: 'goal_id',
          as: 'cheers',
        },
      },
    ];
  }

  private pipeAddCheerStats(user_id: string): IPipeline[] {
    return [
      {
        $addFields: {
          total_cheers: { $size: { $ifNull: ['$cheers', []] } },
          my_cheered_id: {
            $let: {
              vars: {
                myCheer: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: { $ifNull: ['$cheers', []] },
                        as: 'c',
                        cond: { $eq: ['$$c.created_by_id', user_id] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: '$$myCheer._id',
            },
          },
        },
      },
    ];
  }

  private pipeJoinComments(): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'goal_id',
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'comments.created_by_id',
          foreignField: '_id',
          as: 'temp_comment_users',
        },
      },
      {
        $addFields: {
          total_comments: { $size: { $ifNull: ['$comments', []] } },
          comments: {
            $slice: [
              {
                $sortArray: {
                  input: {
                    $map: {
                      input: '$comments',
                      as: 'comment',
                      in: {
                        $mergeObjects: [
                          '$$comment',
                          {
                            created_by: {
                              $first: {
                                $filter: {
                                  input: '$temp_comment_users',
                                  as: 'user',
                                  cond: { $eq: ['$$user._id', '$$comment.created_by_id'] },
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  sortBy: { created_at: -1 }, // sort newest first
                },
              },
              1,
            ],
          },
        },
      },
      {
        $unset: 'temp_comment_users',
      },
    ];
  }

  private pipeFinalProjection(): IPipeline[] {
    return [
      {
        $project: {
          _id: 1,
          specific: 1,
          measurable: 1,
          achievable: 1,
          relevant: 1,
          time: 1,
          thumbnail_url: 1,
          visibility: 1,
          status: 1,
          progress: 1,
          created_at: 1,
          updated_at: 1,
          // comments
          comments: 1,
          total_comments: 1,
          // cheers
          cheers: 1,
          total_cheers: 1,
          my_cheered_id: 1,
          // support
          my_support: 1,
          // users
          created_by: {
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
