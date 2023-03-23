import { DynamoDBClient, PutRequest } from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { v1 as uuidV1 } from 'uuid';

type CreateRunEntryParams = {
  runEntryId?: string;
  weeklyReportId: string;
  userId: string;
  runDistance: number;
  goalDistance: number;
};

class RunEntryService {
  private client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({ region: 'ap-northeast-2' });
  }

  generatePutRequest({
    runEntryId,
    weeklyReportId,
    userId,
    runDistance,
    goalDistance,
  }: CreateRunEntryParams): PutRequest {
    const id = runEntryId || uuidV1();

    return {
      Item: {
        PK: { S: `weeklyReport#${weeklyReportId}` },
        SK: { S: `runEntry#${id}` },
        EntityType: { S: 'runEntry' },
        runDistance: { N: `${runDistance}` },
        goalDistance: { N: `${goalDistance}` },
        GSI: { S: userId },
      },
    };
  }
}

export default RunEntryService;
