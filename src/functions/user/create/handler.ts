import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v1 as uuidV1 } from 'uuid';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import schema from './schema';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { name, email } = event.body;

  const userId = uuidV1();

  const command = new PutItemCommand({
    TableName: 'dalsamo-single-table',
    Item: {
      PK: { S: `user#${userId}` },
      SK: { S: `user#${userId}` },
      entityType: { S: 'user' },
      name: { S: name },
      email: email ? { S: email } : { NULL: true },
    },
  });

  try {
    await client.send(command);
  } catch (error) {
    console.log(error);
    return formatJSONResponse({ message: 'user create failed', event, error });
  }

  return formatJSONResponse({ message: `user created - ${userId}`, event });
};

export const main = middyfy(hello);
