import { type IDatabase } from '@point-hub/papi';

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info('[seed] goals data');
  const documents: Record<string, unknown>[] = [];
  await dbConnection.collection('goals').createMany(documents, options);
};
