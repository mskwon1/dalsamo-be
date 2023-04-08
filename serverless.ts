import type { AWS, AwsResourcePolicyStatements } from '@serverless/typescript';

import functions from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'dalsamo-be',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-iam-roles-per-function',
    'serverless-dotenv-plugin',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    region: 'ap-northeast-2',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      binaryMediaTypes: ['multipart/form-data', 'image/png', 'image/jpeg'],
      resourcePolicy:
        '${self:custom.resourcePolicy.${sls:stage}}' as unknown as AwsResourcePolicyStatements,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  resources: {
    Resources: {
      dalsamoSingleTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          KeySchema: [
            {
              AttributeName: 'PK',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'SK',
              KeyType: 'RANGE',
            },
          ],
          AttributeDefinitions: [
            {
              AttributeName: 'PK',
              AttributeType: 'S',
            },
            {
              AttributeName: 'SK',
              AttributeType: 'S',
            },
            {
              AttributeName: 'GSI',
              AttributeType: 'S',
            },
            {
              AttributeName: 'EntityType',
              AttributeType: 'S',
            },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'gsi_sk',
              KeySchema: [
                {
                  AttributeName: 'GSI',
                  KeyType: 'HASH',
                },
                {
                  AttributeName: 'SK',
                  KeyType: 'RANGE',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
              },
            },
            {
              IndexName: 'et_pk',
              KeySchema: [
                {
                  AttributeName: 'EntityType',
                  KeyType: 'HASH',
                },
                {
                  AttributeName: 'PK',
                  KeyType: 'RANGE',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
              },
            },
          ],
          BillingMode: 'PROVISIONED',
          TableName: '${sls:stage}-dalsamo-single-table',
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
  // import the function via paths
  functions: functions,
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      external: ['sharp', 'tesseract.js'],
      packagerOptions: [
        'npm install --arch=x64 --platform=linux sharp',
        'npm install tesseract.js',
      ],
    },
    resourcePolicy: {
      dev: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: 'execute-api:Invoke',
          Resource: 'execute-api:/*/*/*',
        },
        {
          Effect: 'Deny',
          Principal: '*',
          Action: 'execute-api:Invoke',
          Resource: 'execute-api:/*/*/*',
          Condition: {
            StringLike: {
              'aws:UserAgent': ['*Postman*', '*Curl*'],
            },
          },
        },
      ],
      prod: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: 'execute-api:Invoke',
          Resource: 'execute-api:/*/*/*',
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
