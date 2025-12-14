import { type INotificationEntity } from './interface';

export const collectionName = 'notifications';

export class NotificationEntity {
  constructor(public data: INotificationEntity) { }
}
