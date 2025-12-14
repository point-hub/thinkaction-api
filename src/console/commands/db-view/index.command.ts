import {
  BaseConsoleCommand,
  BaseDatabaseConnection,
  BaseMongoDBConnection,
} from '@point-hub/papi';

import mongoDBConfig from '@/config/mongodb';
import { CreateViewRepository } from '@/repositories/create-view.repository';

export default class DbViewCommand extends BaseConsoleCommand {
  constructor() {
    super({
      name: 'db:view',
      description: 'Create database view',
      summary: 'Create database view',
      arguments: [],
      options: [],
    });
  }

  async handle(): Promise<void> {
    const dbConnection = new BaseDatabaseConnection(new BaseMongoDBConnection(mongoDBConfig.url, mongoDBConfig.name));
    try {
      await dbConnection.open();

      const createViewRepository = new CreateViewRepository(dbConnection);
      await createViewRepository.handle('viewer', 'goals', []);
    } catch (error) {
      console.error(error);
    } finally {
      dbConnection.close();
    }
  }
}
