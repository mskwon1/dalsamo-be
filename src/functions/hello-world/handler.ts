import { formatJSONResponse } from '@libs/api-gateway';
import { APIGatewayProxyHandler } from 'aws-lambda';

const helloWorld: APIGatewayProxyHandler = async (event) => {
  return formatJSONResponse({
    message: `Hello World from MinSu`,
    event,
  });
};

export const main = helloWorld;
