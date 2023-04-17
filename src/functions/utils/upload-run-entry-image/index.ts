import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const uploadRunEntryImage: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'utils/upload-run-entry-image',
        request: {
          contentHandling: 'CONVERT_TO_BINARY',
        },
        cors: true,
      },
    },
  ],
  timeout: 30,
  memorySize: 2048,
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['s3:*'],
      Resource: ['arn:aws:s3:::dalsamo-cdn/*', 'arn:aws:s3:::dalsamo-cdn'],
    },
  ],
};

export default uploadRunEntryImage;
