import { DatabaseTestUtil } from '@point-hub/papi';

import mongoDBConfig from '@/config/mongodb';
import type { IGoalEntity } from '@/modules/goals/interface';

await DatabaseTestUtil.open(mongoDBConfig.url, mongoDBConfig.name);

const now = new Date();

// 7 days ago
const from = new Date(now);
from.setDate(from.getDate() - 7);

// 6 days ago
const to = new Date(now);
to.setDate(to.getDate() - 6);

const response = await DatabaseTestUtil.retrieveAll<IGoalEntity>('goals', {
  filter: {
    created_at: {
      $gte: from,
      $lt: to,
    },
  },
});

for (const element of response.data) {
  const data = {
    type: 'goal-reminder',
    actor_id: null,
    recipient_id: element.created_by_id,
    message: 'You have 1 day left to wrap up your goal.',
    is_read: false,
    entities: {
      goals: element._id,
    },
    created_at: new Date(),
  };

  await DatabaseTestUtil.dbConnection.collection('notifications').create(data);
}

await DatabaseTestUtil.close();