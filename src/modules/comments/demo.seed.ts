import { type IDatabase } from '@point-hub/papi';

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info('[seed] comments data');
  const documents: Record<string, unknown>[] = [];
  await dbConnection.collection('comments').createMany(documents, options);
};
