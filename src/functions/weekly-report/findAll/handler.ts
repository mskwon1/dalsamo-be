import { formatJSONResponse } from '@libs/api-gateway';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import * as _ from 'lodash';
import WeeklyReportService from 'src/services/weeklyReportService';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const findAllWeeklyReports: APIGatewayProxyHandler = async (event) => {
  const { queryStringParameters } = event;
  const limit = queryStringParameters?.limit;
  const season = queryStringParameters?.season;

  const weeklyReportService = new WeeklyReportService(client);

  try {
    const weeklyReports = await weeklyReportService.findAll(
      limit ? { limit: _.toNumber(limit), season } : { season }
    );

    return formatJSONResponse({ weeklyReports });
  } catch (error) {
    console.log(error);
    return formatJSONResponse({
      message: 'findAll weeklyReports failed',
      event,
      error,
    });
  }
};

export const main = findAllWeeklyReports;
