import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import WeeklyReportService from 'src/services/weeklyReportService';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const handler = async () => {
  const weeklyReportService = new WeeklyReportService(client);

  try {
    const weeklyReports = await weeklyReportService.findAll({ limit: 99 });
    const weeklyReportsWithSeason = weeklyReports.map((entry) => {
      return {
        ...entry,
        weeklyReportId: entry.id,
        season: '2023',
      };
    });

    console.log(weeklyReports);

    const { createdItemsCount } = await weeklyReportService.createOrUpdateMany(
      weeklyReportsWithSeason
    );

    console.log(createdItemsCount);
  } catch (error) {
    console.log(error);
  }
};

export const main = handler;
