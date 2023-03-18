import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v1 as uuidV1 } from 'uuid';
import {
  AttributeValue,
  BatchWriteItemCommand,
  DynamoDBClient,
  ScanCommand,
  WriteRequest,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import schema from './schema';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { startDate } = event.body;

  const weeklyReportId = uuidV1();

  const readUsersCommand = new ScanCommand({
    TableName: 'dalsamo-single-table',
    FilterExpression: 'entityType = :val',
    ExpressionAttributeValues: { ':val': { S: 'user' } },
  });

  const { Items: users } = await client.send(readUsersCommand);
  console.log(users);

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
        ...users.map((user) =>
          createRunEntryPutRequest({ weeklyReportId, user })
        ),
      ],
    },
  });

  try {
    await client.send(initializeCommand);
  } catch (error) {
    console.log(error);
    return formatJSONResponse({
      message: 'weekly report initialize failed',
      event,
      error,
    });
  }

  return formatJSONResponse({
    message: `weekly report initialized - ${weeklyReportId}`,
    event,
  });
};

const createRunEntryPutRequest = (params: {
  weeklyReportId: string;
  user: Record<string, AttributeValue>;
}): WriteRequest => {
  const {
    weeklyReportId,
    user: {
      PK: { S: userId },
    },
  } = params;

  const runEntryId = uuidV1();

  return {
    PutRequest: {
      Item: {
        PK: { S: `weeklyReport#${weeklyReportId}` },
        SK: { S: `runEntry#${runEntryId}` },
        entityType: { S: 'runEntry' },
        runDistance: { NULL: true },
        goalDistance: { N: `${7}` },
        GSI: { S: userId },
      },
    },
  };
};

export const main = middyfy(handler);
