import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { formatErrorResponse } from '@libs/api-gateway';
import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { JWTPayload } from 'jose';
import _ from 'lodash';
import UserService from 'src/services/userService';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const verifyAdminMiddleware: MiddlewareObj<
  APIGatewayProxyEvent & { auth: { payload: JWTPayload; token: string } }
> = {
  before: async ({ event }) => {
    const { payload } = event.auth;

    if (!payload) {
      return formatErrorResponse(401, { message: 'missing jwt payload' });
    }

    const { id } = payload;

    const userService = new UserService(client);

    try {
      const user = await userService.findOneById(id as string);

      if (!user) {
        return formatErrorResponse(401, { message: 'user not found' });
      }

      const { roles } = user;

      if (!_.includes(roles, 'admin')) {
        return formatErrorResponse(403, { message: 'forbidden' });
      }
    } catch (e) {
      console.log(e);
      return formatErrorResponse(500, { message: 'forbidden' });
    }
  },
};

export default verifyAdminMiddleware;
