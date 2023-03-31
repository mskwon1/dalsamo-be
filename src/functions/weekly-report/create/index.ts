import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const createWeeklyReport: LambdaFunctionEntry = {
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
        cors: {
          origins: ['https://*.mskwon.click'],
        },
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:PutItem', 'dynamodb:BatchWriteItem'],
      Resource: [
        { 'Fn::GetAtt': ['dalsamoSingleTable', 'Arn'] },
        {
          'Fn::Join': [
            '/',
            [{ 'Fn::GetAtt': ['dalsamoSingleTable', 'Arn'] }, 'index/*'],
          ],
        },
      ],
    },
  ],
};

export default createWeeklyReport;
