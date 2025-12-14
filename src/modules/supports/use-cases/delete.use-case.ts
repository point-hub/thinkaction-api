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

import type { IDeleteRepository } from '../repositories/delete.repository';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';

export interface IInput {
  _id: string
  user: IUserEntity
}

export interface IDeps {
  retrieveRepository: IRetrieveRepository
  deleteRepository: IDeleteRepository
  notificationService: NotificationService
  ablyService: IAblyService
}

export interface ISuccessData {
  deleted_count: number
}

/**
 * Use case: Delete support.
 *
 * Responsibilities:
 * 1. Retrieve the support data by ID.
 * 2. Delete the support record from the repository.
 * 3. Build notification payload for the supported user.
 * 4. Store notification in the notification system.
 * 5. Publish realtime notification via Ably.
 * 6. Return standardized success response.
 */
export class DeleteUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(
    input: IInput,
  ): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve the support data by ID.
    const support = await this.deps.retrieveRepository.handle(input._id);

    // 2. Delete the support record from the repository.
    const response = await this.deps.deleteRepository.handle(input._id);

    // 3. Build notification payload for the supported user.
    const message = this.deps.notificationService.getTemplate('support', {
      '[username]': input.user.username ?? '',
    });

    const data = {
      type: 'unsupport' as NotificationType,
      actor_id: input.user._id,
      recipient_id: support.supporting._id,
      message,
      is_read: false,
      created_at: new Date(),
    };

    // 4. Store notification in the notification system.
    await this.deps.notificationService.handle({ data });

    // 5. Publish realtime notification via Ably.
    this.deps.ablyService.publish(
      `notifications:${data.recipient_id}`,
      'new',
      {
        ...data,
        actor: input.user,
      },
    );

    // 6. Return standardized success response.
    return this.success({
      deleted_count: response.deleted_count,
    });
  }
}
