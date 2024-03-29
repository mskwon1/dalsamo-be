import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import schema from './schema';
import WeeklyReportService from 'src/services/weeklyReportService';
import RunEntryService from 'src/services/runEntryService';
import _ from 'lodash';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import verifyJwtMiddleware from 'src/middlewares/verifyJwtMiddleware';
import verifyAdminMiddleware from 'src/middlewares/verifyAdminMiddleware';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { startDate, runEntries, season } = event.body;

  const weeklyReportService = new WeeklyReportService(client);
  const runEntryService = new RunEntryService(client);

  try {
    const weeklyReportId = await weeklyReportService.create({
      startDate,
      status: 'pending',
      season,
    });

    const { createdItemsCount } = await runEntryService.createOrUpdateMany(
      _.map(runEntries, (rawEntry) => {
        const { userId, goalDistance, userName } = rawEntry;

        return {
          weeklyReportId,
          runDistance: 0,
          userId,
          userName,
          goalDistance,
          season,
        };
      })
    );

    console.log(`${createdItemsCount} run entries created`);

    return formatJSONResponse({
      message: `weekly report created - ${weeklyReportId}`,
      createdId: weeklyReportId,
    });
  } catch (error) {
    console.log(error);
    return formatJSONResponse({
      message: 'weekly report create failed',
      event,
      error,
    });
  }
};

export const main = middyfy(handler)
  .use(httpHeaderNormalizer())
  .use(verifyJwtMiddleware({ passthrough: false }))
  .use(verifyAdminMiddleware);
