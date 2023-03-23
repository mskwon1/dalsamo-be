import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v1 as uuidV1 } from 'uuid';
import {
  BatchWriteItemCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import schema from './schema';
import UserService from 'src/services/userService';
import WeeklyReportService from 'src/services/weeklyReportService';
import RunEntryService from 'src/services/runEntryService';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { startDate } = event.body;

  const weeklyReportId = uuidV1();

  const userService = new UserService();
  const users = await userService.findAll({ limit: 50 });

  const weeklyReportService = new WeeklyReportService();
  const runEntryService = new RunEntryService();

  const initializeCommand = new BatchWriteItemCommand({
    RequestItems: {
      [`${process.env.STAGE}-dalsamo-single-table`]: [
        {
          PutRequest: weeklyReportService.generatePutRequest({
            status: 'pending',
            startDate,
          }),
        },
        ...users.map((user) => {
          return {
            PutRequest: runEntryService.generatePutRequest({
              weeklyReportId,
              userId: user.id,
              goalDistance: user.currentGoal,
              runDistance: 0,
            }),
          };
        }),
      ],
    },
  });

  try {
    await client.send(initializeCommand);
  } catch (error) {
    console.log(error);
    return formatJSONResponse({
      message: 'weekly report initialize failed',
      event,
      error,
    });
  }

  return formatJSONResponse({
    message: `weekly report initialized - ${weeklyReportId}`,
    event,
  });
};

export const main = middyfy(handler);
