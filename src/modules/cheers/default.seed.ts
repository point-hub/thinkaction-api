import { type IDatabase } from '@point-hub/papi';

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info('[truncate] cheers data');
  // delete all data inside collection
  await dbConnection.collection('cheers').deleteAll(options);
};
