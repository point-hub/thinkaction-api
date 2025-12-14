import type { IDatabase, IDocument } from '@point-hub/papi';

import { throwApiError } from '@/utils/throw-api-error';

import { collectionName } from '../entity';

export interface ICreateRepository {
  handle(document: IDocument): Promise<ICreateOutput>
}

export interface ICreateOutput {
  inserted_id: string
}

export class CreateRepository implements ICreateRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(document: IDocument): Promise<ICreateOutput> {
    // Check if a document already exists with goal_id and created_by_id
    const existingData = await this.database
      .collection(collectionName)
      .retrieveAll({
        filter: {
          $and: [
            { goal_id: document['goal_id'] },
            { created_by_id: document['created_by_id'] },
          ],
        },
        page_size: 1,
      });

    if (existingData.data.length > 0) {
      throwApiError(400);
    }

    return await this.database
      .collection(collectionName)
      .create({ ...document, created_at: new Date() }, this.options);
  }
}
