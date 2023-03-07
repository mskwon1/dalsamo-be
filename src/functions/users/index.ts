import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';
import { AWS, AwsIamPolicyStatements } from '@serverless/typescript';

type LambdaFunctionEntry = AWS['functions'][keyof AWS['functions']] & {
  iamRoleStatements?: AwsIamPolicyStatements;
};

const func: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'create-user',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:PutItem'],
      Resource: 'arn:aws:dynamodb:ap-northeast-2:497580819378:table/Users',
    },
  ],
};

export default func;
