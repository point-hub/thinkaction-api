import { type IDatabase } from '@point-hub/papi';

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info('[seed] cheers data');
  const documents: Record<string, unknown>[] = [];
  await dbConnection.collection('cheers').createMany(documents, options);
};
