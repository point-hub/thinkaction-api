/**
 * MongoDB Schema
 *
 * https://www.mongodb.com/docs/current/core/schema-validation/update-schema-validation/
 * https://www.mongodb.com/docs/drivers/node/current/fundamentals/indexes/
 * https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/
 */

import type { ISchema } from '@point-hub/papi';

import { collectionName } from './entity';

export const schema: ISchema[] = [
  {
    collection: collectionName,
    unique: [['supporter_id', 'supporting_id']],
    uniqueIfExists: [],
    indexes: [],
    schema: {
      bsonType: 'object',
      required: ['supporter_id', 'supporting_id'],
      properties: {
        supporter_id: {
          bsonType: 'objectId',
          description: 'The ID of the user who provides support.',
        },
        supporting_id: {
          bsonType: 'objectId',
          description: 'The ID of the user who receives support.',
        },
        created_at: {
          bsonType: 'date',
          description: 'Timestamp indicating when the support relationship was created.',
        },
      },
    },
  },
];
