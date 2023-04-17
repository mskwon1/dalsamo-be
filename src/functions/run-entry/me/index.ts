import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const getUserRunEntries: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'run-entries/me',
        cors: true,
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:Query'],
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

export default getUserRunEntries;
