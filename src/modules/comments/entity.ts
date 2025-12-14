import { type ICommentEntity } from './interface';

export const collectionName = 'comments';

export class CommentEntity {
  constructor(public data: ICommentEntity) { }
}
