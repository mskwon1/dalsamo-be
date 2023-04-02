import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import schema from './schema';
import RunEntryService from 'src/services/runEntryService';
import * as _ from 'lodash';
import FineService from 'src/services/fineService';
import UserService from 'src/services/userService';
import WeeklyReportService from 'src/services/weeklyReportService';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const {
    pathParameters: { weeklyReportId },
  } = event;
  const { runEntries } = event.body;

  const runEntryService = new RunEntryService(client);
  const weeklyReportService = new WeeklyReportService(client);
  const fineService = new FineService(client);
  const userService = new UserService(client);

  try {
    const fineTargets = [];

    for (const entry of runEntries) {
      const { id, goalDistance, runDistance, userId, userName } = entry;

      const updatedEntry = await runEntryService.update(
        { weeklyReportId, runEntryId: id },
        { runDistance, goalDistance }
      );

      const fineValue = FineService.calculateFine({
        runDistance,
        goalDistance,
      });

      if (fineValue) {
        fineTargets.push({
          weeklyReportId,
          userId,
          userName,
          value: fineValue,
        });
      } else {
        const updatedUser = await userService.update(userId, {
          currentGoal: goalDistance + 1,
        });

        console.log(updatedUser);
      }

      console.log(updatedEntry);
    }

    if (!_.isEmpty(fineTargets)) {
      const createdCount = await fineService.createMany(fineTargets);

      console.log({ createdCount });
    }

    const updatedWeeklyReport = await weeklyReportService.update(
      weeklyReportId,
      { status: 'confirmed' }
    );

    console.log(updatedWeeklyReport);

    return formatJSONResponse({
      message: `weekly report closed - ${weeklyReportId}`,
      event,
    });
  } catch (error) {
    console.log(error);
    return formatJSONResponse({
      message: 'weekly report close failed',
      event,
      error,
    });
  }
};

export const main = middyfy(handler);
