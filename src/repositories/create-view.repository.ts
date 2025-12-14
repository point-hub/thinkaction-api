import type { IDatabase,  IPipeline } from '@point-hub/papi';

export class CreateViewRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(name: string, source: string, pipeline: IPipeline[]): Promise<void> {
    const collections = await this.database.listCollections();
    if (collections.length > 0 && collections.some(c => c.name === 'viewer')) {
      await this.database.dropCollection(name);
    }

    await this.database.command({
      create: name,
      viewOn: source,
      pipeline,
    });
  }
}
