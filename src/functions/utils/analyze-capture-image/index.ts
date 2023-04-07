import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const analyzeCaptureImage: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'utils/analyze-capture-image',
        request: {
          contentHandling: 'CONVERT_TO_BINARY',
        },
        cors: true,
      },
    },
  ],
  timeout: 900,
  memorySize: 4096,
};

export default analyzeCaptureImage;
