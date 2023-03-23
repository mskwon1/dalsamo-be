import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const initializeWeeklyReport: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'weekly-reports',
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
      Action: ['dynamodb:PutItem', 'dynamodb:Query', 'dynamodb:BatchWriteItem'],
      Resource: { 'Fn::GetAtt': ['dalsamoSingleTable', 'Arn'] },
    },
  ],
};

export default initializeWeeklyReport;
