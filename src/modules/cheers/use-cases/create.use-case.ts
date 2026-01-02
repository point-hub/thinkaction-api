import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IAblyService } from '@/modules/ably/services/ably.service';
import type { IRetrieveRepository } from '@/modules/goals/repositories/retrieve.repository';
import type { INotificationService, NotificationType } from '@/modules/notifications/services/notification.service';
import type { IUserEntity } from '@/modules/users/interface';

import { CheerEntity } from '../entity';
import type { ICreateRepository } from '../repositories/create.repository';

export interface IInput {
  user: IUserEntity
  data: {
    goal_id: string
    measurable: string
    achievable: string
    relevant: string
    time: Date
    thumbnail_url: string
    visibility: 'public' | 'private' | 'supporters'
  }
}

export interface IDeps {
  createRepository: ICreateRepository
  goalRetrieveRepository: IRetrieveRepository
  notificationService: INotificationService
  ablyService: IAblyService
}

export interface ISuccessData {
  inserted_id: string
}

/**
 * Use case: Handle cheer creation.
 *
 * Responsibilities:
 * 1. Retrieve the goal and ensure the user has permission to comment on it.
 * 2. Create a CheerEntity and apply necessary transformations.
 * 3. Persist the cheer data into the repository.
 * 4. Prepare notification payload for the goal owner.
 * 5. Return success response with the inserted ID.
 */
export class CreateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve the goal and ensure the user has permission to comment on it.
    const goal = await this.deps.goalRetrieveRepository.handle(input.data.goal_id, input.user._id!);

    // 2. Create a CheerEntity and apply necessary transformations.
    const cheerEntity = new CheerEntity({
      goal_id: input.data.goal_id,
      created_by_id: input.user._id,
    });

    // 3. Persist the cheer data into the repository.
    const responseCreate = await this.deps.createRepository.handle(cheerEntity.data);

    // 4. Prepare notification payload for the goal owner.
    const message = this.deps.notificationService.getTemplate('cheers', {
      '[username]': input.user.username ?? '',
    });

    const data = {
      type: 'cheers' as NotificationType,
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
      // Create the notification record in the database.
      await this.deps.notificationService.handle({ data });

      // Publish realtime notification event to the recipient’s channel.
      this.deps.ablyService.publish(`notifications:${goal.created_by._id}`, 'new', {
        ...data,
        actor: input.user,
      });
    }

    // 5. Return success response with the inserted ID.
    return this.success({
      inserted_id: responseCreate.inserted_id,
    });
  }
}
