import {
  ValidatedEventAPIGatewayProxyEvent,
  formatErrorResponse,
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import schema from './schema';
import FineService from 'src/services/fineService';
import verifyJwtMiddleware from 'src/middlewares/verifyJwtMiddleware';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import verifyAdminMiddleware from 'src/middlewares/verifyAdminMiddleware';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const createFine: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { weeklyReportId, userId, userName, value } = event.body;
  const fineService = new FineService(client);

  try {
    const fineId = await fineService.create({
      weeklyReportId: weeklyReportId || 'none',
      userId,
      userName,
      value,
    });

    return formatJSONResponse({
      message: `fine created - ${fineId}`,
      createdId: fineId,
    });
  } catch (error) {
    console.log(error);
    return formatErrorResponse(500, { message: 'fine create failed' });
  }
};

export const main = middyfy(createFine)
  .use(httpHeaderNormalizer())
  .use(verifyJwtMiddleware({ passthrough: false }))
  .use(verifyAdminMiddleware);
