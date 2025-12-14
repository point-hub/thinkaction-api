import { BaseFactory, type IDatabase } from '@point-hub/papi';

import { type INotificationEntity } from './interface';
import { CreateRepository } from './repositories/create.repository';
import { CreateManyRepository } from './repositories/create-many.repository';

export default class NotificationFactory extends BaseFactory<INotificationEntity> {
  constructor(public dbConnection: IDatabase) {
    super();
  }

  definition() {
    return {
      created_at: new Date(),
    };
  }

  async create() {
    const notificationCreateRepository = new CreateRepository(this.dbConnection);
    return await notificationCreateRepository.handle(this.makeOne());
  }

  async createMany(count: number) {
    const notificationCreateManyRepository = new CreateManyRepository(this.dbConnection);
    return await notificationCreateManyRepository.handle(this.makeMany(count));
  }
}
