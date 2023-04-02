import {
  AttributeValue,
  BatchWriteItemCommand,
  DynamoDBClient,
  PutRequest,
  ReturnConsumedCapacity,
  ReturnValue,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { DALSAMO_SINGLE_TABLE } from 'src/constants';
import { v1 as uuidV1 } from 'uuid';

type CreateRunEntryParams = {
  weeklyReportId: string;
  userId: string;
  userName: string;
  runDistance: number;
  goalDistance: number;
};

type UpdateRunEntryParams = {
  runDistance: number;
  goalDistance: number;
  status: 'pending' | 'confirmed';
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
          return { PutRequest: this.generatePutRequest(entry) };
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

  async update(
    key: { runEntryId: string; weeklyReportId: string },
    params: UpdateRunEntryParams
  ): Promise<RunEntryEntity> {
    const { runEntryId, weeklyReportId } = key;
    const { runDistance, goalDistance, status } = params;

    const updateCommand = new UpdateItemCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      Key: {
        PK: { S: `weeklyReport#${weeklyReportId}` },
        SK: { S: `runEntry#${runEntryId}` },
      },
      UpdateExpression: 'SET runDistance = :rd, goalDistance = :gd, status=:st',
      ExpressionAttributeValues: {
        ':rd': { N: `${runDistance}` },
        ':gd': { N: `${goalDistance}` },
        ':st': { S: status },
      },
      ReturnValues: ReturnValue.ALL_NEW,
    });

    const { Attributes } = await this.client.send(updateCommand);

    return RunEntryService.parseRunEntryDocument(Attributes);
  }

  generatePutRequest({
    runEntryId,
    weeklyReportId,
    userId,
    userName,
    runDistance,
    goalDistance,
  }: {
    runEntryId?: string;
    weeklyReportId: string;
    userId: string;
    userName: string;
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
        userName: { S: userName },
      },
    };
  }

  static parseRunEntryDocument(
    runEntryDocument: Record<string, AttributeValue>
  ): RunEntryEntity {
    const {
      SK: { S: id },
      goalDistance: { N: goalDistance },
      runDistance: { N: runDistance },
      userName: { S: userName },
      GSI: { S: userId },
    } = runEntryDocument;

    return {
      id: _.split(id, '#')[1],
      goalDistance: _.toNumber(goalDistance),
      runDistance: _.toNumber(runDistance),
      userId: _.split(userId, '#')[1],
      userName,
    };
  }
}

export default RunEntryService;
