import { handlerPath } from '@libs/handler-resolver';
import { LambdaFunctionEntry } from 'src/utils';

const migrateRunEntrySeason: LambdaFunctionEntry = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:BatchWriteItem', 'dynamodb:Query'],
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

export default migrateRunEntrySeason;
