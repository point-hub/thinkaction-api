import { BaseFactory, type IDatabase } from '@point-hub/papi';

import { type ICommentEntity } from './interface';
import { CreateRepository } from './repositories/create.repository';
import { CreateManyRepository } from './repositories/create-many.repository';

export default class CommentFactory extends BaseFactory<ICommentEntity> {
  constructor(public dbConnection: IDatabase) {
    super();
  }

  definition() {
    return {
      created_at: new Date(),
    };
  }

  async create() {
    const commentCreateRepository = new CreateRepository(this.dbConnection);
    return await commentCreateRepository.handle(this.makeOne());
  }

  async createMany(count: number) {
    const commentCreateManyRepository = new CreateManyRepository(this.dbConnection);
    return await commentCreateManyRepository.handle(this.makeMany(count));
  }
}
