import type { IDatabase, IPipeline } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IRetrieveRepository {
  handle(_id: string, user_id?: string): Promise<IRetrieveOutput>
}

export interface IRetrieveOutput {
  _id: string
  smart: string
  specific: string
  measurable: string
  achievable: string
  relevant: string
  time: Date
  thumbnail_url: string
  visibility: 'public' | 'private' | 'supporters'
  status: 'in-progress' | 'achieved' | 'failed'
  progress?: {
    _id: string
    goal_id: string
    caption: string
    media_url: string
    thumbnail_url: string
    created_at: Date
  }[]
  created_by_id: string
  created_by: {
    _id: string
    username: string
    email: string
  }
  created_at: Date
  updated_at: Date
}

export class RetrieveRepository implements IRetrieveRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(_id: string, user_id?: string): Promise<IRetrieveOutput> {
    const pipeline: IPipeline[] = [];

    pipeline.push({ $match: { _id } });
    pipeline.push(...this.pipeJoinCreatedByUser());
    pipeline.push(...this.pipeJoinCheers());
    if (user_id) pipeline.push(...this.pipeAddCheerStats(user_id));
    pipeline.push(...this.pipeJoinComments());
    pipeline.push(...this.pipeFinalProjection());

    const response = await this.database
      .collection(collectionName)
      .aggregate(pipeline, { page_size: 1 }, this.options);


    return response.data[0] as unknown as IRetrieveOutput;
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

  private pipeAddCheerStats(userId: string): IPipeline[] {
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
                        cond: { $eq: ['$$c.user_id', userId] },
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
          localField: 'comments.created_by',
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
                                  cond: { $eq: ['$$user._id', '$$comment.created_by'] },
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
          // comments
          comments: 1,
          total_comments: 1,
          // cheers
          cheers: 1,
          total_cheers: 1,
          my_cheered_id: 1,
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
