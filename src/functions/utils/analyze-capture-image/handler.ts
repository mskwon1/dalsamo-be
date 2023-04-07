import { formatJSONResponse } from '@libs/api-gateway';
import middy from '@middy/core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpMultipartBodyParser from '@middy/http-multipart-body-parser';
import UserService from 'src/services/userService';
import { APIGatewayProxyHandler } from 'aws-lambda';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const analyzeCaptureImage: APIGatewayProxyHandler = async (event) => {
  try {
    console.log(event);
    console.log(event.body);

    return formatJSONResponse({ message: `test analyze capture image` });
  } catch (error) {
    console.log(error);
    return formatJSONResponse({ message: 'somehow failed' });
  }
};

export const main = middy(analyzeCaptureImage)
  .use(httpHeaderNormalizer())
  .use(httpMultipartBodyParser());
