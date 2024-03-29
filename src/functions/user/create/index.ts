import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const createUser: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'users',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
        cors: true,
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:PutItem', 'dynamodb:GetItem'],
      Resource: { 'Fn::GetAtt': ['dalsamoSingleTable', 'Arn'] },
    },
  ],
};

export default createUser;
