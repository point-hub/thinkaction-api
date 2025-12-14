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
    unique: [['goal_id', 'created_by_id']],
    uniqueIfExists: [],
    indexes: [],
    schema: {
      bsonType: 'object',
      required: ['goal_id', 'created_by_id', 'created_at'],
      properties: {
        goal_id: {
          bsonType: 'objectId',
          description: 'The ID of the goal associated with this record.',
        },
        created_at: {
          bsonType: 'date',
          description: 'Timestamp when this record was created.',
        },
        created_by_id: {
          bsonType: 'objectId',
          description: 'The ID of the user who cheers the goal.',
        },
      },
    },
  },
];
