import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const findAllUsers: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'users',
        request: {
          parameters: {
            querystrings: { limit: true },
          },
        },
        cors: {
          origins: ['https://*.mskwon.click', '*'],
        },
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

export default findAllUsers;
