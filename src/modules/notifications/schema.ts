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
    indexes: [{ spec: ['recipient_id'], options: {} }],
    schema: {
      bsonType: 'object',
      required: ['type', 'recipient_id', 'message', 'is_read', 'created_at'],
      properties: {
        type: {
          bsonType: 'string',
          description: 'The type of notification (e.g., support).',
        },
        actor_id: {
          bsonType: 'objectId',
          description: 'The ID of the user who triggered the notification.',
        },
        recipient_id: {
          bsonType: 'objectId',
          description: 'The ID of the user receiving the notification.',
        },
        message: {
          bsonType: 'string',
          description: 'The notification message displayed to the recipient.',
        },
        is_read: {
          bsonType: 'bool',
          description: 'Indicates whether the notification has been read.',
        },
        entities: {
          bsonType: 'object',
          description: 'Map of related entity types to their ObjectId',
          additionalProperties: {
            bsonType: 'objectId',
          },
        },
        created_at: {
          bsonType: 'date',
          description: 'Timestamp when the notification was created.',
        },
      },
    },
  },
];
