import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { ICreateRepository } from '../repositories/create.repository';

export type NotificationType = 'support' | 'unsupport' | 'cheers' | 'comment' | 'comment-replied' | 'goal-failed'

export interface INotificationTemplate { type: NotificationType, notification: string }

export interface INotificationService {
  handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed>
  getTemplate(type: NotificationType,payload: Record<string, string>): string
}


export const notificationTemplate: INotificationTemplate[] = [
  {
    type: 'support',
    notification: '[username] is supporting you',
  },
  {
    type: 'unsupport',
    notification: '[username] is no longer supporting you',
  },
  {
    type: 'cheers',
    notification: '[username] is cheers on your goal',
  },
  {
    type: 'comment',
    notification: '[username] is commenting on your goal',
  },
  {
    type: 'comment-replied',
    notification: '[username] replied to your comment',
  },
  {
    type: 'goal-failed',
    notification: 'You failed to achieve your goal',
  },
];

interface IInput {
  data: {
    type?: NotificationType
    actor_id?: string // user who triggered it (friend, commenter, liker)
    recipient_id?: string // user who receives the notification
    message?: string
    entities?: Record<string, string>
    is_read?: boolean
    read_at?: Date
    thumbnail_url?: string
    created_at?: Date
  }
}

export interface IDeps {
  createRepository: ICreateRepository
}

export interface ISuccessData {
  inserted_id: string
}

export class NotificationService extends BaseUseCase<IInput, IDeps, ISuccessData> implements INotificationService {

  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {

    const response = await this.deps.createRepository.handle(input.data);

    return this.success({
      inserted_id: response.inserted_id,
    });
  }

  getTemplate(type: NotificationType, payload: Record<string, string>) {
    const template = notificationTemplate.find(t => t.type === type);

    if (!template) {
      return '';
    }

    for (const key in payload) {
      template.notification = template.notification.replace(key, payload[key]);
    }

    return template.notification;
  }
}
