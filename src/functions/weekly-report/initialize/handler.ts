import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v1 as uuidV1 } from 'uuid';
import {
  BatchWriteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';

import schema from './schema';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { startDate } = event.body;

  const weeklyReportId = uuidV1();

  const readUsersCommand = new ScanCommand({
    TableName: 'dalsamo-single-table',
  });

  const initializeCommand = new BatchWriteItemCommand({
    RequestItems: {
      'dalsamo-single-table': [
        {
          PutRequest: {
            Item: {
              PK: { S: `weeklyReport#${weeklyReportId}` },
              SK: { S: `weeklyReport#${weeklyReportId}` },
              entityType: { S: 'weeklyReport' },
              startDate: { S: startDate },
              status: { S: 'pending' },
            },
          },
        },
      ],
    },
  });

  try {
    await client.send(initializeCommand);
  } catch (error) {
    console.log(error);
    return formatJSONResponse({
      message: 'weekly report create failed',
      event,
      error,
    });
  }

  return formatJSONResponse({
    message: `weekly report created - ${weeklyReportId}`,
    event,
  });
};

export const main = middyfy(hello);