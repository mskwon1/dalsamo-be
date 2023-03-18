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
    TableName: 'Users',
    Item: { userId: { S: userId }, name: { S: name }, email: { S: email } },
  });

  try {
    await client.send(command);
  } catch (e) {
    console.log(e);
  }

  return formatJSONResponse({
    message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
    event,
  });
};

export const main = middyfy(hello);
