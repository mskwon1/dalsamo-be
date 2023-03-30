import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import schema from './schema';
import UserService from 'src/services/userService';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { limit } = event.body;

  const userService = new UserService(client);

  try {
    const users = await userService.findAll({ limit });

    return formatJSONResponse({ users });
  } catch (error) {
    console.log(error);
    return formatJSONResponse({ message: 'findAll user failed', event, error });
  }
};

export const main = middyfy(hello);
