import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import UserService from 'src/services/userService';
import { formatErrorResponse } from '@libs/api-gateway';
import { APIGatewayProxyHandler } from 'aws-lambda';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import _ from 'lodash';
import verifyDalsamoJwt from '@libs/verify-dalsamo-jwt';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const getMeHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const { headers } = event;

    console.log(headers);
    const { authorization } = headers;
    console.log(authorization);

    const token = _.split(authorization, ' ')[1];
    console.log(token);

    const jwtPayload = await verifyDalsamoJwt(token);
    console.log(jwtPayload);

    if (!jwtPayload) {
      return formatErrorResponse(401, {
        message: 'token verify failed',
      });
    }

    const userService = new UserService(client);
    const user = await userService.findOneById(jwtPayload.id as string);

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

export const main = middyfy(getMeHandler).use(httpHeaderNormalizer());
