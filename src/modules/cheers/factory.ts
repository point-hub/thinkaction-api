import { BaseFactory, type IDatabase } from '@point-hub/papi';

import { type ICheerEntity } from './interface';
import { CreateRepository } from './repositories/create.repository';
import { CreateManyRepository } from './repositories/create-many.repository';

export default class CheerFactory extends BaseFactory<ICheerEntity> {
  constructor(public dbConnection: IDatabase) {
    super();
  }

  definition() {
    return {
      created_at: new Date(),
    };
  }

  async create() {
    const cheerCreateRepository = new CreateRepository(this.dbConnection);
    return await cheerCreateRepository.handle(this.makeOne());
  }

  async createMany(count: number) {
    const cheerCreateManyRepository = new CreateManyRepository(this.dbConnection);
    return await cheerCreateManyRepository.handle(this.makeMany(count));
  }
}
