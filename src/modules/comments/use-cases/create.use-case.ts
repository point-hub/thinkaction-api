import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import { type IAblyService } from '@/modules/ably/services/ably.service';
import type { IRetrieveRepository as IGoalRetrieveRepository } from '@/modules/goals/repositories/retrieve.repository';
import type { INotificationService, NotificationType } from '@/modules/notifications/services/notification.service';
import type { IUserEntity } from '@/modules/users/interface';

import { CommentEntity } from '../entity';
import type { ICreateRepository } from '../repositories/create.repository';

export interface IInput {
  user: IUserEntity
  data: {
    goal_id: string
    comment: string
    created_by_id: string
    parent_id: string
    mentions?: {
      _id: string
      label: string
      link?: string
    }[]
  }
}

export interface IDeps {
  createRepository: ICreateRepository
  goalRetrieveRepository: IGoalRetrieveRepository
  notificationService: INotificationService
  ablyService: IAblyService
}

export interface ISuccessData {
  inserted_id: string
}

/**
 * Use case: Handle comment creation.
 *
 * Responsibilities:
 * 1. Retrieve the goal and validate access.
 * 2. Create a CommentEntity and apply necessary transformations.
 * 3. Persist the comment data into the repository.
 * 4. Build notification payload for goal owner.
 * 5. Store notification in the notification system.
 * 6. Publish realtime notification via Ably.
 * 7. Return success response with the inserted comment ID.
 */
export class CreateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve the goal and ensure the user has permission to comment on it.
    const goal = await this.deps.goalRetrieveRepository.handle(input.data.goal_id, input.user._id!);

    // 2. Create a CommentEntity and normalize data.
    const commentEntity = new CommentEntity({
      goal_id: input.data.goal_id,
      comment: input.data.comment,
      created_by_id: input.user._id,
      parent_id: input.data.parent_id,
      mentions: input.data.mentions,
    });

    // 3. Save the comment into the repository.
    const responseCreate = await this.deps.createRepository.handle(commentEntity.data);

    // 4. Prepare notification payload for the goal owner.
    const message = this.deps.notificationService.getTemplate('comment', {
      '[username]': input.user.username ?? '',
    });

    const data = {
      type: 'comment' as NotificationType,
      actor_id: input.user._id ?? '',
      recipient_id: goal.created_by._id,
      message: message,
      is_read: false,
      thumbnail_url: goal.thumbnail_url,
      created_at: new Date(),
      entities: {
        goals: input.data.goal_id,
      },
    };

    // If actor is not the recipient itself
    if (data.actor_id !== data.recipient_id) {
      // 5. Create the notification record in the database.
      await this.deps.notificationService.handle({ data });

      // 6. Publish realtime notification event to the recipient’s channel.
      this.deps.ablyService.publish(`notifications:${goal.created_by._id}`, 'new', {
        ...data,
        actor: input.user,
      });
    }

    // 7. Return success response including inserted comment ID.
    return this.success({
      inserted_id: responseCreate.inserted_id,
    });
  }
}
