import {
  type IDatabase,
  type IPagination,
  type IPipeline,
  type IQuery,
} from '@point-hub/papi';

import { collectionName } from '../entity';
import type { IRetrieveOutput } from './retrieve.repository';

export interface IRetrieveAllProgressRepository {
  handle(query: IQuery): Promise<IRetrieveAllProgressOutput>
}

export interface IRetrieveAllProgressOutput {
  data: IRetrieveOutput[]
  pagination: IPagination
}

export class RetrieveAllProgressRepository implements IRetrieveAllProgressRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  /* -------------------------------------------------------------
   * Main Handler
   * ------------------------------------------------------------- */
  async handle(query: IQuery): Promise<IRetrieveAllProgressOutput> {
    const pipeline: IPipeline[] = [];

    // Join users & supporters first (goal-level)
    pipeline.push(...this.pipeJoinCreatedByUser());
    pipeline.push(...this.pipeFilterVisibility(query['user']?._id));

    // Convert each progress item into its own document
    pipeline.push(...this.pipeUnwindProgress());

    // Global story ordering
    pipeline.push(...this.pipeSortProgress());

    // Final shape
    pipeline.push(...this.pipeFinalProjection());

    const response = await this.database.collection(collectionName).aggregate(pipeline, query, this.options);

    return {
      data: response.data as unknown as IRetrieveOutput[],
      pagination: response.pagination,
    };
  }

  /* -------------------------------------------------------------
   * Joins
   * ------------------------------------------------------------- */

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

  /* -------------------------------------------------------------
   * Visibility
   * ------------------------------------------------------------- */

  private pipeFilterVisibility(user_id?: string): IPipeline[] {
    const conditions: IPipeline[] = [
      { $eq: ['$visibility', 'public'] },
      {
        $and: [
          { $eq: ['$visibility', 'supporters'] },
          { $gt: [{ $size: { $ifNull: ['$my_support', []] } }, 0] },
        ],
      },
    ];

    if (user_id) {
      conditions.push(
        {
          $and: [
            { $eq: ['$visibility', 'supporters'] },
            { $eq: ['$created_by_id', user_id] },
          ],
        },
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
          $expr: { $or: conditions },
        },
      },
    ];
  }

  /* -------------------------------------------------------------
   * Progress Handling
   * ------------------------------------------------------------- */

  private pipeUnwindProgress(): IPipeline[] {
    return [
      {
        $unwind: {
          path: '$progress',
          preserveNullAndEmptyArrays: false,
        },
      },
    ];
  }

  private pipeSortProgress(): IPipeline[] {
    return [
      {
        $sort: {
          'progress.created_at': -1, // newest first
        },
      },
    ];
  }

  /* -------------------------------------------------------------
   * Final Output Shape (ONE progress per row)
   * ------------------------------------------------------------- */

  private pipeFinalProjection(): IPipeline[] {
    return [
      {
        $project: {
          _id: '$progress._id',
          goal_id: '$_id',

          // progress
          caption: '$progress.caption',
          media_url: '$progress.media_url',
          thumbnail_url: '$progress.thumbnail_url',
          created_at: '$progress.created_at',

          // goal
          visibility: 1,
          status: 1,

          // user
          created_by: {
            _id: '$created_by._id',
            name: '$created_by.name',
            username: '$created_by.username',
            avatar: '$created_by.avatar',
          },
        },
      },
    ];
  }
}
