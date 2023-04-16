import {
  AttributeValue,
  BatchWriteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutRequest,
  QueryCommand,
  ReturnConsumedCapacity,
  ReturnValue,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { DALSAMO_SINGLE_TABLE, DBIndexName } from 'src/constants';
import { generateKSUID } from 'src/utils';

type CreateRunEntryParams = {
  weeklyReportId: string;
  userId: string;
  userName: string;
  runDistance: number;
  goalDistance: number;
};

type UpdateRunEntryParams = {
  runDistance?: number;
  goalDistance?: number;
  imageUrls?: string[];
};

class RunEntryService {
  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  async findAllByUser(userId: string): Promise<RunEntryEntity[]> {
    const runEntries = [];

    let lastKey: Record<string, AttributeValue> | undefined;
    do {
      const readRunEntriesCommand = new QueryCommand({
        TableName: DALSAMO_SINGLE_TABLE,
        IndexName: DBIndexName.ET_GSI,
        KeyConditionExpression: 'EntityType = :pk_val AND GSI = :gsi_val',
        ExpressionAttributeValues: {
          ':pk_val': { S: 'runEntry' },
          ':gsi_val': { S: `user#${userId}` },
        },
        ExclusiveStartKey: lastKey,
      });

      const { Items: runEntriesChunk, LastEvaluatedKey } =
        await this.client.send(readRunEntriesCommand);

      console.log({ runEntriesChunk, LastEvaluatedKey });

      runEntries.push(...runEntriesChunk);
      lastKey = LastEvaluatedKey;
    } while (!_.isNil(lastKey));

    console.log(runEntries);

    return _.map(runEntries, RunEntryService.parseRunEntryDocument);
  }

  async findOneByKey(key: {
    weeklyReportId: string;
    runEntryId: string;
  }): Promise<RunEntryEntity | null> {
    const { weeklyReportId, runEntryId } = key;

    const getRunEntryItemCommand = new GetItemCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      Key: {
        PK: { S: `weeklyReport#${weeklyReportId}` },
        SK: { S: `runEntry#${runEntryId}` },
      },
    });

    const { Item } = await this.client.send(getRunEntryItemCommand);

    if (!Item) {
      return null;
    }

    return RunEntryService.parseRunEntryDocument(Item);
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

  private buildParitalUpdate(params: UpdateRunEntryParams): {
    updateExpression: string;
    expressionAttributeValues: Record<string, AttributeValue>;
  } {
    const { runDistance, goalDistance, imageUrls } = params;

    if (_.isEmpty(params)) {
      return {
        updateExpression: '',
        expressionAttributeValues: {},
      };
    }

    const expressions = [];
    const expressionAttributeValues: Record<string, AttributeValue> = {};

    if (!_.isNil(runDistance)) {
      expressions.push('runDistance = :rd');
      expressionAttributeValues[':rd'] = { N: `${runDistance}` };
    }

    if (!_.isNil(goalDistance)) {
      expressions.push('goalDistance = :gd');
      expressionAttributeValues[':gd'] = { N: `${goalDistance}` };
    }

    if (!_.isNil(imageUrls)) {
      expressions.push('imageUrls = :imgs');
      expressionAttributeValues[':imgs'] = { SS: imageUrls };
    }

    const updateExpression = `SET ${expressions.join(', ')}`;

    return {
      updateExpression,
      expressionAttributeValues,
    };
  }

  async update(
    key: { runEntryId: string; weeklyReportId: string },
    params: UpdateRunEntryParams
  ): Promise<RunEntryEntity> {
    const { runEntryId, weeklyReportId } = key;

    const { updateExpression, expressionAttributeValues } =
      this.buildParitalUpdate(params);

    const updateCommand = new UpdateItemCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      Key: {
        PK: { S: `weeklyReport#${weeklyReportId}` },
        SK: { S: `runEntry#${runEntryId}` },
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
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
    const id = runEntryId || generateKSUID();

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
      PK: { S: weeklyReportId },
      SK: { S: id },
      goalDistance: { N: goalDistance },
      runDistance: { N: runDistance },
      userName: { S: userName },
      GSI: { S: userId },
      imageUrls,
    } = runEntryDocument;

    return {
      id: _.split(id, '#')[1],
      weeklyReportId: _.split(weeklyReportId, '#')[1],
      goalDistance: _.toNumber(goalDistance),
      runDistance: _.toNumber(runDistance),
      userId: _.split(userId, '#')[1],
      userName,
      imageUrls: imageUrls ? imageUrls.SS : [],
    };
  }
}

export default RunEntryService;
