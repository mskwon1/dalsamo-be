import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const openWeeklyReport: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'put',
        path: 'weekly-report/{weeklReportId}/run-entry/{runEntryId}',
        request: {
          parameters: {
            paths: { weeklyReportId: true, runEntryId: true },
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
      Action: ['dynamodb:UpdateItem', 'dynamodb:GetItem'],
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

export default openWeeklyReport;
