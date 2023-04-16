import {
  AttributeValue,
  BatchWriteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  PutRequest,
  QueryCommand,
  ReturnConsumedCapacity,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { DALSAMO_SINGLE_TABLE, DBIndexName } from 'src/constants';
import { generateKSUID } from 'src/utils';

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

  async findAll(): Promise<FineEntity[]> {
    const fines = [];

    let lastKey: Record<string, AttributeValue> | undefined;
    do {
      const readFinesCommand = new QueryCommand({
        TableName: DALSAMO_SINGLE_TABLE,
        IndexName: DBIndexName.ET_PK,
        KeyConditionExpression: 'EntityType = :pk_val',
        ExpressionAttributeValues: { ':pk_val': { S: 'fine' } },
        ExclusiveStartKey: lastKey,
      });

      const { Items: finesChunk, LastEvaluatedKey } = await this.client.send(
        readFinesCommand
      );

      console.log({ finesChunk, LastEvaluatedKey });

      fines.concat(finesChunk);
      lastKey = LastEvaluatedKey;
    } while (!_.isNil(lastKey));

    console.log(fines);

    return _.map(fines, FineService.parseFineDocument);
  }

  async create(params: CreateFineParams): Promise<string> {
    const fineId = generateKSUID();

    const command = new PutItemCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      ...this.generatePutRequest({ fineId, ...params }),
    });

    await this.client.send(command);

    return fineId;
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
    const id = fineId || generateKSUID();

    return {
      Item: {
        PK: { S: `weeklyReport#${weeklyReportId}` },
        SK: { S: `fine#${id}` },
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
      PK: { S: weeklyReportId },
      SK: { S: id },
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
