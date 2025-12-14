import { type IDatabase } from '@point-hub/papi';

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info('[truncate] comments data');
  // delete all data inside collection
  await dbConnection.collection('comments').deleteAll(options);
};
