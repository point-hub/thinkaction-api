import { type IDatabase, type IPagination, type IPipeline, type IQuery } from '@point-hub/papi';

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
    const pipeline: IPipeline[] = [];

    const filter: Record<string, unknown>[] = [];

    if (query['filter.name']) filter.push({ name: { $regex: query['filter.name'], $options: 'i' } });
    if (query['filter.username']) filter.push({ username: { $regex: query['filter.username'], $options: 'i' } });
    if (query['name']) filter.push({ name: { $regex: query['name'], $options: 'i' } });
    if (query['username']) filter.push({ username: { $regex: query['username'], $options: 'i' } });

    pipeline.push({
      $match: filter.length ? { $or: filter } : {},
    });

    const response = await this.database
      .collection(collectionName)
      .aggregate(pipeline, query, this.options);

    return {
      data: response.data as unknown as IRetrieveOutput[],
      pagination: response.pagination,
    };
  }
}
