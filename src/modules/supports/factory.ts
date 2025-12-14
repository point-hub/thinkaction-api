import { BaseFactory, type IDatabase } from '@point-hub/papi';

import { type ISupportEntity } from './interface';
import { CreateRepository } from './repositories/create.repository';
import { CreateManyRepository } from './repositories/create-many.repository';

export default class SupportFactory extends BaseFactory<ISupportEntity> {
  constructor(public dbConnection: IDatabase) {
    super();
  }

  definition() {
    return {
      created_at: new Date(),
    };
  }

  async create() {
    const supportCreateRepository = new CreateRepository(this.dbConnection);
    return await supportCreateRepository.handle(this.makeOne());
  }

  async createMany(count: number) {
    const supportCreateManyRepository = new CreateManyRepository(this.dbConnection);
    return await supportCreateManyRepository.handle(this.makeMany(count));
  }
}
