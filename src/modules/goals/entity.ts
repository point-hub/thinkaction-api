import { type IGoalEntity } from './interface';

export const collectionName = 'goals';

export class GoalEntity {
  constructor(public data: IGoalEntity) { }
}
