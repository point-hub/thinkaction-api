import { BaseFactory, type IDatabase } from '@point-hub/papi';

import { type IGoalEntity } from './interface';
import { CreateRepository } from './repositories/create.repository';
import { CreateManyRepository } from './repositories/create-many.repository';

export default class GoalFactory extends BaseFactory<IGoalEntity> {
  constructor(public dbConnection: IDatabase) {
    super();
  }

  definition() {
    return {
      created_at: new Date(),
    };
  }

  async create() {
    const goalCreateRepository = new CreateRepository(this.dbConnection);
    return await goalCreateRepository.handle(this.makeOne());
  }

  async createMany(count: number) {
    const goalCreateManyRepository = new CreateManyRepository(this.dbConnection);
    return await goalCreateManyRepository.handle(this.makeMany(count));
  }
}
