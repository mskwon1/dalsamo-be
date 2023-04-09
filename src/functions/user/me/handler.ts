import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import UserService from 'src/services/userService';
import { formatErrorResponse } from '@libs/api-gateway';
import { APIGatewayProxyHandler, Handler } from 'aws-lambda';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import _ from 'lodash';
import verifyDalsamoJwt from '@libs/verify-dalsamo-jwt';
import verifyJwtMiddleware from 'src/middlewares/verifyJwtMiddleware';
import { JWTPayload } from 'jose';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const getMeHandler: Handler<{
  auth: { payload: JWTPayload; token: string };
}> = async (event) => {
  try {
    const { payload, token } = event.auth;

    console.log(event.auth);

    const userService = new UserService(client);
    const user = await userService.findOneById(payload.id as string);

    console.log(user);

    if (!user) {
      return formatErrorResponse(401, {
        message: 'user not found',
      });
    }

    return formatJSONResponse({
      message: `me fetched`,
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return formatErrorResponse(500, {
      message: 'me fetch failed',
    });
  }
};

export const main = middyfy(getMeHandler)
  .use(httpHeaderNormalizer())
  .use(verifyJwtMiddleware({ passthrough: false }));
