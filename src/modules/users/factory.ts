import { BaseFactory, type IDatabase } from '@point-hub/papi';

import { type IUserEntity } from './interface';
import { CreateRepository } from './repositories/create.repository';
import { CreateManyRepository } from './repositories/create-many.repository';

export default class UserFactory extends BaseFactory<IUserEntity> {
  constructor(public dbConnection: IDatabase) {
    super();
  }

  definition() {
    return {
      created_at: new Date(),
    };
  }

  async create() {
    const userCreateRepository = new CreateRepository(this.dbConnection);
    return await userCreateRepository.handle(this.makeOne());
  }

  async createMany(count: number) {
    const userCreateManyRepository = new CreateManyRepository(this.dbConnection);
    return await userCreateManyRepository.handle(this.makeMany(count));
  }
}
