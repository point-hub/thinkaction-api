import { type IDatabase } from '@point-hub/papi';

export const seed = async (dbConnection: IDatabase, options: unknown) => {
  console.info('[truncate] goals data');
  // delete all data inside collection
  await dbConnection.collection('goals').deleteAll(options);
};
