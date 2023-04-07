import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const analyzeCaptureImage: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'utils/analyze-capture-image',
        cors: true,
      },
    },
  ],
};

export default analyzeCaptureImage;
