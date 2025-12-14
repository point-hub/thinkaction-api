import { type IDatabase } from '@point-hub/papi';

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info('[truncate] supports data');
  // delete all data inside collection
  await dbConnection.collection('supports').deleteAll(options);
};
