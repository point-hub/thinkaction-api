import { type ICheerEntity } from './interface';

export const collectionName = 'cheers';

export class CheerEntity {
  constructor(public data: ICheerEntity) { }
}
