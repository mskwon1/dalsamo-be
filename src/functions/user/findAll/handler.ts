import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import UserService from 'src/services/userService';
import { APIGatewayProxyHandler } from 'aws-lambda';
import * as _ from 'lodash';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const findAllUsers: APIGatewayProxyHandler = async (event) => {
  const {
    queryStringParameters: { limit },
  } = event;

  const userService = new UserService(client);

  try {
    const users = await userService.findAll({ limit: _.toNumber(limit) });

    return formatJSONResponse({ users });
  } catch (error) {
    console.log(error);
    return formatJSONResponse({ message: 'findAll user failed', event, error });
  }
};

export const main = middyfy(findAllUsers);
