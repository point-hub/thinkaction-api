import { type IDatabase } from '@point-hub/papi';

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info('[seed] notifications data');
  const documents: Record<string, unknown>[] = [];
  await dbConnection.collection('notifications').createMany(documents, options);
};
