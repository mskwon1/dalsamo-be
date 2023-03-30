import {
  DynamoDBClient,
  PutItemCommand,
  PutRequest,
  ReturnConsumedCapacity,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { DALSAMO_SINGLE_TABLE } from 'src/constants';
import { v1 as uuidV1 } from 'uuid';

type CreateWeeklyReportParams = {
  startDate: string;
  status: 'pending' | 'confirmed';
};

class WeeklyReportService {
  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  private generateId() {
    return uuidV1();
  }

  async create(params: CreateWeeklyReportParams): Promise<string> {
    const weeklyReportId = this.generateId();

    const command = new PutItemCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      ...this.generatePutRequest({
        weeklyReportId,
        ...params,
      }),
      ReturnConsumedCapacity: ReturnConsumedCapacity.TOTAL,
    });

    await this.client.send(command);

    return weeklyReportId;
  }

  generatePutRequest({
    weeklyReportId,
    startDate,
    status,
  }: {
    weeklyReportId: string;
    startDate: string;
    status: 'pending' | 'confirmed';
  }): PutRequest {
    return {
      Item: {
        PK: { S: `weeklyReport#${weeklyReportId}` },
        SK: { S: `weeklyReport#${weeklyReportId}` },
        EntityType: { S: 'weeklyReport' },
        startDate: { S: startDate },
        status: { S: status },
      },
    };
  }
}

export default WeeklyReportService;
