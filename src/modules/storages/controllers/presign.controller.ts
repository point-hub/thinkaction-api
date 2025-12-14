import type { IController, IControllerInput } from '@point-hub/papi';
import { S3Client } from 'bun';

import s3Config from '@/config/s3';

export const presignController: IController = async (controllerInput: IControllerInput) => {
  const client = new S3Client({
    endpoint: s3Config.endpoint,
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
    bucket: s3Config.bucket,
  });

  const upload = client.presign('avatars', {
    bucket: s3Config.bucket,
    expiresIn: 1800,
    method: 'PUT',
  });

  controllerInput.res.status(200);
  controllerInput.res.json({
    upload_url: upload,
  });
};
