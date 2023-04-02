import {
  AttributeValue,
  BatchWriteItemCommand,
  DynamoDBClient,
  PutRequest,
  ReturnConsumedCapacity,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { DALSAMO_SINGLE_TABLE } from 'src/constants';
import { v1 as uuidV1 } from 'uuid';

type CreateFineParams = {
  weeklyReportId: string;
  userId: string;
  userName: string;
  value: number;
};

const MAX_FINE = 30000;

class FineService {
  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  async createMany(
    entries: CreateFineParams[]
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
    fineId,
    weeklyReportId,
    userId,
    userName,
    value,
  }: {
    fineId?: string;
    weeklyReportId: string;
    userId: string;
    userName: string;
    value: number;
  }): PutRequest {
    const id = fineId || uuidV1();

    return {
      Item: {
        PK: { S: `fine#${id}` },
        SK: { S: `weeklyReport#${weeklyReportId}` },
        EntityType: { S: 'fine' },
        value: { N: `${value}` },
        GSI: { S: `user#${userId}` },
        userName: { S: userName },
      },
    };
  }

  static parseFineDocument(
    fineDocument: Record<string, AttributeValue>
  ): FineEntity {
    const {
      PK: { S: id },
      SK: { S: weeklyReportId },
      GSI: { S: userId },
      userName: { S: userName },
      value: { N: value },
    } = fineDocument;

    return {
      id: _.split(id, '#')[1],
      weeklyReportId: _.split(weeklyReportId, '#')[1],
      userId: _.split(userId, '#')[1],
      userName,
      value: _.toNumber(value),
    };
  }

  static calculateFine(params: { runDistance: number; goalDistance: number }) {
    const { runDistance, goalDistance } = params;

    if (runDistance >= goalDistance) {
      return 0;
    }

    const uncoveredDistance = _.ceil(goalDistance - runDistance);

    return _.round((MAX_FINE * uncoveredDistance) / goalDistance);
  }
}

export default FineService;