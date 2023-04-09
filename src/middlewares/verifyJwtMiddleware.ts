import { formatErrorResponse } from '@libs/api-gateway';
import verifyDalsamoJwt from '@libs/verify-dalsamo-jwt';
import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { JWTPayload } from 'jose';
import _ from 'lodash';

const verifyJwtMiddleware: (options: {
  passthrough: boolean;
}) => MiddlewareObj<
  APIGatewayProxyEvent & { auth: { payload: JWTPayload; token: string } }
> = ({ passthrough }) => {
  return {
    before: async ({ event }) => {
      const { headers } = event;

      console.log(headers);
      const { authorization } = headers;
      console.log(authorization);

      if (!authorization) {
        return;
      }

      const token = _.split(authorization, ' ')[1];
      console.log(token);

      if (!token) {
        return formatErrorResponse(401, { message: 'token does not exist' });
      }

      try {
        const jwtPayload = await verifyDalsamoJwt(token);

        console.log(jwtPayload);

        event.auth = {
          payload: jwtPayload,
          token,
        };
      } catch (e) {
        console.log(e);

        if (!passthrough) {
          return formatErrorResponse(401, { message: 'token verify failed' });
        }
      }
    },
  };
};

export default verifyJwtMiddleware;
