import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import type { FromSchema } from 'json-schema-to-ts';

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & {
  body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export const formatJSONResponse = (
  response: Record<string, unknown>,
  headers: Record<string, string> = {}
) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      ...headers,
    },
    body: JSON.stringify(response),
  };
};

export const formatErrorResponse = (
  statusCode: number,
  response: Record<string, unknown>
) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(response),
  };
};
