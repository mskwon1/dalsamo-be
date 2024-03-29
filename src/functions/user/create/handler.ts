import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import schema from './schema';
import UserService from 'src/services/userService';
import verifyJwtMiddleware from 'src/middlewares/verifyJwtMiddleware';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import verifyAdminMiddleware from 'src/middlewares/verifyAdminMiddleware';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const createUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { name, email } = event.body;

  const userService = new UserService(client);

  try {
    const userId = await userService.create({ name, email });

    return formatJSONResponse({ message: `user created - ${userId}`, event });
  } catch (error) {
    console.log(error);
    return formatJSONResponse({ message: 'user create failed', event, error });
  }
};

export const main = middyfy(createUser)
  .use(httpHeaderNormalizer())
  .use(verifyJwtMiddleware({ passthrough: false }))
  .use(verifyAdminMiddleware);
