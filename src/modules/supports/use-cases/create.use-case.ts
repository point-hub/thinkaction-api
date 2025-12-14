import {
  BaseUseCase,
  type IUseCaseOutputFailed,
  type IUseCaseOutputSuccess,
} from '@point-hub/papi';

import type { IAblyService } from '@/modules/ably/services/ably.service';
import type {
  NotificationService,
  NotificationType,
} from '@/modules/notifications/services/notification.service';
import type { IUserEntity } from '@/modules/users/interface';

import { SupportEntity } from '../entity';
import type { ICreateRepository } from '../repositories/create.repository';

export interface IInput {
  user: IUserEntity
  data: {
    supporting_id: string
    supporter_id: string
  }
}

export interface IDeps {
  createRepository: ICreateRepository
  notificationService: NotificationService
  ablyService: IAblyService
}

export interface ISuccessData {
  inserted_id: string
}

/**
 * Use case: Create support.
 *
 * Responsibilities:
 * 1. Validate support rules (prevent self-support).
 * 2. Create a SupportEntity and normalize data.
 * 3. Persist the support data into the repository.
 * 4. Build notification payload for the supported user.
 * 5. Store notification in the notification system.
 * 6. Publish realtime notification via Ably.
 * 7. Return success response with the inserted support ID.
 */
export class CreateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(
    input: IInput,
  ): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Validate support rules (prevent self-support).
    if (input.user._id === input.data.supporting_id) {
      return this.fail({
        code: 400,
        message: 'You cannot support yourself',
      });
    }

    // 2. Create a SupportEntity and normalize data.
    const supportEntity = new SupportEntity({
      supporter_id: input.user._id,
      supporting_id: input.data.supporting_id,
    });

    // 3. Persist the support data into the repository.
    const responseCreate = await this.deps.createRepository.handle(
      supportEntity.data,
    );

    // 4. Build notification payload for the supported user.
    const message = this.deps.notificationService.getTemplate('support', {
      '[username]': input.user.username ?? '',
    });

    const data = {
      type: 'support' as NotificationType,
      actor_id: input.user._id,
      recipient_id: supportEntity.data.supporting_id,
      message,
      is_read: false,
      created_at: new Date(),
    };

    if (data.actor_id !== data.recipient_id) {
      // 5. Store notification in the notification system.
      await this.deps.notificationService.handle({ data });

      // 6. Publish realtime notification via Ably.
      this.deps.ablyService.publish(
        `notifications:${data.recipient_id}`,
        'new',
        {
          ...data,
          actor: input.user,
        },
      );
    }

    // 7. Return success response with the inserted support ID.
    return this.success({
      inserted_id: responseCreate.inserted_id,
    });
  }
}
