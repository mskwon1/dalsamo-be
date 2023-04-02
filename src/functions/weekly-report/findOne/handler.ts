import { formatErrorResponse, formatJSONResponse } from '@libs/api-gateway';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import WeeklyReportService from 'src/services/weeklyReportService';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const findOneWeeklyReport: APIGatewayProxyHandler = async (event) => {
  const {
    pathParameters: { weeklyReportId },
  } = event;

  const weeklyReportService = new WeeklyReportService(client);

  try {
    const weeklyReport = await weeklyReportService.findOneById(weeklyReportId);

    if (!weeklyReport) {
      return formatErrorResponse(404, {
        message: `weekly report not found - ${weeklyReportId}`,
      });
    }

    return formatJSONResponse(weeklyReport);
  } catch (error) {
    console.log(error);
    return formatErrorResponse(500, {
      message: `findOne weeklyReport failed - ${weeklyReportId}`,
      event,
      error,
    });
  }
};

export const main = findOneWeeklyReport;
