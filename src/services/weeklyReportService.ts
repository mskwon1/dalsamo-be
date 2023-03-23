import { DynamoDBClient, PutRequest } from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { v1 as uuidV1 } from 'uuid';

type CreateWeeklyReportParams = {
  weeklyReportId?: string;
  startDate: string;
  status: 'pending' | 'confirmed';
};

class WeeklyReportService {
  private client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({ region: 'ap-northeast-2' });
  }

  generatePutRequest({
    weeklyReportId,
    startDate,
    status,
  }: CreateWeeklyReportParams): PutRequest {
    const id = weeklyReportId || uuidV1();

    return {
      Item: {
        PK: { S: `weeklyReport#${id}` },
        SK: { S: `weeklyReport#${id}` },
        entityType: { S: 'weeklyReport' },
        startDate: { S: startDate },
        status: { S: status },
      },
    };
  }
}

export default WeeklyReportService;
