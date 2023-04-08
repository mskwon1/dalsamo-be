import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const closeWeeklyReport: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'weekly-reports/{weeklyReportId}/close',
        request: {
          parameters: {
            paths: { weeklyReportId: true },
          },
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
      Action: ['dynamodb:BatchWriteItem', 'dynamodb:UpdateItem'],
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
    {
      Effect: 'Allow',
      Action: ['s3:*'],
      Resource: ['arn:aws:s3:::dalsamo-cdn/*', 'arn:aws:s3:::dalsamo-cdn'],
    },
  ],
};

export default closeWeeklyReport;
