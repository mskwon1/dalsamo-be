import {
  BatchWriteItemCommand,
  DynamoDBClient,
  PutRequest,
  ReturnConsumedCapacity,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { DALSAMO_SINGLE_TABLE } from 'src/constants';
import { v1 as uuidV1 } from 'uuid';

type CreateRunEntryParams = {
  weeklyReportId: string;
  userId: string;
  name: string;
  runDistance: number;
  goalDistance: number;
};

class RunEntryService {
  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  async createMany(
    entries: CreateRunEntryParams[]
  ): Promise<{ createdItemsCount: number }> {
    const command = new BatchWriteItemCommand({
      RequestItems: {
        [DALSAMO_SINGLE_TABLE]: entries.map((entry) => {
          return {
            PutRequest: this.generatePutRequest(entry),
          };
        }),
      },
      ReturnConsumedCapacity: ReturnConsumedCapacity.TOTAL,
    });

    const { ConsumedCapacity } = await this.client.send(command);

    const createdItemsCount = _.chain(ConsumedCapacity)
      .filter({ TableName: DALSAMO_SINGLE_TABLE })
      .head()
      .get('CapacityUnits', 0)
      .value();

    return { createdItemsCount };
  }

  generatePutRequest({
    runEntryId,
    weeklyReportId,
    userId,
    runDistance,
    goalDistance,
  }: {
    runEntryId?: string;
    weeklyReportId: string;
    userId: string;
    runDistance: number;
    goalDistance: number;
  }): PutRequest {
    const id = runEntryId || uuidV1();

    return {
      Item: {
        PK: { S: `weeklyReport#${weeklyReportId}` },
        SK: { S: `runEntry#${id}` },
        EntityType: { S: 'runEntry' },
        runDistance: { N: `${runDistance}` },
        goalDistance: { N: `${goalDistance}` },
        GSI: { S: `user#${userId}` },
      },
    };
  }
}

export default RunEntryService;
