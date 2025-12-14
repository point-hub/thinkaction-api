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
      required: [
        'specific',
        'measurable',
        'achievable',
        'relevant',
        'time',
        'thumbnail_url',
        'visibility',
        'status',
        'created_by_id',
        'created_at',
      ],
      properties: {
        specific: {
          bsonType: 'string',
          description: 'Details describing the specific objective of the goal.',
        },
        measurable: {
          bsonType: 'string',
          description: 'Information describing how progress can be measured.',
        },
        achievable: {
          bsonType: 'string',
          description: 'Details explaining how the goal is attainable.',
        },
        relevant: {
          bsonType: 'string',
          description: 'Rationale explaining why the goal is meaningful or relevant.',
        },
        time: {
          bsonType: 'date',
          description: 'The target date or deadline for achieving the goal.',
        },
        thumbnail_url: {
          bsonType: 'string',
          description: 'URL of the thumbnail image associated with the goal.',
        },
        visibility: {
          bsonType: 'string',
          enum: ['public', 'private', 'supporters'],
          description: 'Controls who can view the goal (public, private, or supporters only).',
        },
        status: {
          bsonType: 'string',
          enum: ['in-progress', 'achieved', 'archived'],
          description: 'The current status of the goal.',
        },
        progress: {
          bsonType: 'array',
          description: 'List of progress updates for this goal.',
          items: {
            bsonType: 'object',
            required: ['goal_id', 'caption', 'created_at'],
            properties: {
              _id: {
                bsonType: 'string',
                description: 'Unique identifier for the progress entry.',
              },
              goal_id: {
                bsonType: 'objectId',
                description: 'Reference to the parent goal ID.',
              },
              caption: {
                bsonType: 'string',
                description: 'Story or description related to the uploaded photo.',
              },
              media_url: {
                bsonType: 'string',
                description: 'URL of the uploaded media (image/video).',
              },
              thumbnail_url: {
                bsonType: 'string',
                description: 'URL of the thumbnail image for the media.',
              },
              created_at: {
                bsonType: 'date',
                description: 'Timestamp when this progress entry was created.',
              },
            },
            additionalProperties: false,
          },
        },
        created_by_id: {
          bsonType: 'objectId',
          description: 'The ID of the user who created the goal.',
        },
        created_at: {
          bsonType: 'date',
          description: 'Timestamp when the goal was created.',
        },
        updated_at: {
          bsonType: 'date',
          description: 'Timestamp when the goal was updated.',
        },
      },
    },
  },
];
