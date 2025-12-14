import Ably from 'ably';

import ablyConfig from '@/config/ably';

export interface IAblyService {
  publish(channelName: string, event: string, data: Record<string, unknown>): Promise<void>
}

const ably = new Ably.Rest({ key: ablyConfig.ablyApiKey });

export const AblyService: IAblyService = {
  async publish(channelName, event, data) {
    try {
      const channel = ably.channels.get(channelName);
      await channel.publish(event, data);
    } catch (error) {
      console.error('[Ably] Failed to publish', error);
    }
  },
};
