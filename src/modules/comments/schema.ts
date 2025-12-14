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
    unique: [],
    uniqueIfExists: [],
    indexes: [],
    schema: {
      bsonType: 'object',
      required: ['goal_id', 'comment', 'created_by_id', 'created_at'],
      properties: {
        goal_id: {
          bsonType: 'objectId',
          description: 'The ID of the goal this comment belongs to.',
        },
        parent_id: {
          bsonType: 'objectId',
          description: 'The ID of the parent comment when this is a reply.',
        },
        comment: {
          bsonType: 'string',
          description: 'The content of the comment.',
        },
        created_by_id: {
          bsonType: 'objectId',
          description: 'The ID of the user who wrote the comment.',
        },
        created_at: {
          bsonType: 'date',
          description: 'Timestamp when the comment was created.',
        },
        updated_at: {
          bsonType: 'date',
          description: 'Timestamp when the comment was updated.',
        },
      },
    },
  },
];
