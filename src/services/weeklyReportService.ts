import {
  AttributeValue,
  BatchWriteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  PutRequest,
  QueryCommand,
  ReturnConsumedCapacity,
  ReturnValue,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import {
  BATCH_WRITE_MAX_ELEMENTS,
  DALSAMO_SINGLE_TABLE,
  DBIndexName,
} from 'src/constants';
import RunEntryService from './runEntryService';
import { generateKSUID } from 'src/utils';
import FineService from './fineService';

type CreateWeeklyReportParams = {
  startDate: string;
  status: 'pending' | 'confirmed';
  season: string;
};

type CreateOrUpdateManyWeeklyReportElement = {
  weeklyReportId: string;
  startDate: string;
  status: 'pending' | 'confirmed';
  season: string;
};

type UpdateWeeklyReportParams = {
  status: 'pending' | 'confirmed';
  reportImageUrl?: string;
};

class WeeklyReportService {
  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  private generateId() {
    return generateKSUID();
  }

  async findOneById(
    weeklyReportId: string
  ): Promise<ComposedWeeklyReportEntity | null> {
    const readWeeklyReportCommand = new QueryCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      KeyConditionExpression: 'PK = :pk_val',
      ExpressionAttributeValues: {
        ':pk_val': { S: `weeklyReport#${weeklyReportId}` },
      },
    });

    const { Items } = await this.client.send(readWeeklyReportCommand);

    const weeklyReport = _.find(
      Items,
      (item) => item.EntityType?.S === 'weeklyReport'
    );

    if (!weeklyReport) {
      return null;
    }

    const fines = _.chain(Items)
      .filter((item) => item.EntityType?.S === 'fine')
      .map(FineService.parseFineDocument)
      .value();

    const runEntries = _.chain(Items)
      .filter((item) => item.EntityType?.S === 'runEntry')
      .map(RunEntryService.parseRunEntryDocument)
      .value();

    return {
      ...WeeklyReportService.parseWeeklyReportDocument(weeklyReport),
      runEntries,
      fines,
    };
  }

  async findAll(params: {
    limit?: number;
    season?: string;
  }): Promise<WeeklyReportEntity[]> {
    const { limit = 10, season } = params;

    const readWeeklyReportsCommand = new QueryCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      IndexName: DBIndexName.ET_PK,
      KeyConditionExpression: 'EntityType = :pk_val',
      FilterExpression: season ? 'season = :season' : undefined,
      ExpressionAttributeValues: _.omitBy(
        {
          ':pk_val': { S: 'weeklyReport' },
          ':season': season ? { S: season } : undefined,
        },
        _.isUndefined
      ),
    });

    const { Items: weeklyReports } = await this.client.send(
      readWeeklyReportsCommand
    );

    return _.map(
      _.slice(weeklyReports, 0, limit),
      WeeklyReportService.parseWeeklyReportDocument
    );
  }

  async createOrUpdateMany(
    entries: CreateOrUpdateManyWeeklyReportElement[]
  ): Promise<{ createdItemsCount: number }> {
    const chunkedEntries = _.chunk(entries, BATCH_WRITE_MAX_ELEMENTS);

    let createdItemsCount = 0;
    for (const entriesChunk of chunkedEntries) {
      const command = new BatchWriteItemCommand({
        RequestItems: {
          [DALSAMO_SINGLE_TABLE]: entriesChunk.map((entry) => {
            return {
              PutRequest: WeeklyReportService.generatePutRequest(entry),
            };
          }),
        },
        ReturnConsumedCapacity: ReturnConsumedCapacity.TOTAL,
      });

      const { ConsumedCapacity } = await this.client.send(command);

      createdItemsCount += _.chain(ConsumedCapacity)
        .filter({ TableName: DALSAMO_SINGLE_TABLE })
        .head()
        .get('CapacityUnits', 0)
        .value();

      // pause due to write capacity limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return { createdItemsCount };
  }

  async create(params: CreateWeeklyReportParams): Promise<string> {
    const weeklyReportId = this.generateId();

    const command = new PutItemCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      ...WeeklyReportService.generatePutRequest({
        weeklyReportId,
        ...params,
      }),
      ReturnConsumedCapacity: ReturnConsumedCapacity.TOTAL,
    });

    await this.client.send(command);

    return weeklyReportId;
  }

  async update(
    weeklyReportId: string,
    params: UpdateWeeklyReportParams
  ): Promise<WeeklyReportEntity> {
    const { status, reportImageUrl } = params;

    const updateCommand = new UpdateItemCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      Key: {
        PK: { S: `weeklyReport#${weeklyReportId}` },
        SK: { S: `weeklyReport#${weeklyReportId}` },
      },
      UpdateExpression: reportImageUrl
        ? 'SET #S = :st, reportImageUrl = :ri'
        : 'SET #S = :st',
      ExpressionAttributeNames: { '#S': 'status' },
      ExpressionAttributeValues: reportImageUrl
        ? {
            ':st': { S: status },
            ':ri': { S: reportImageUrl },
          }
        : {
            ':st': { S: status },
          },
      ReturnValues: ReturnValue.ALL_NEW,
    });

    const { Attributes } = await this.client.send(updateCommand);

    return WeeklyReportService.parseWeeklyReportDocument(Attributes);
  }

  static generatePutRequest({
    weeklyReportId,
    startDate,
    status,
    reportImageUrl,
    season,
  }: {
    weeklyReportId: string;
    startDate: string;
    status: 'pending' | 'confirmed';
    season: string;
    reportImageUrl?: string;
  }): PutRequest {
    return {
      Item: _.omitBy(
        {
          PK: { S: `weeklyReport#${weeklyReportId}` },
          SK: { S: `weeklyReport#${weeklyReportId}` },
          startDate: { S: startDate },
          EntityType: { S: 'weeklyReport' },
          status: { S: status },
          reportImageUrl: reportImageUrl ? { S: reportImageUrl } : undefined,
          season: { S: season },
        },
        _.isUndefined
      ),
    };
  }

  static parseWeeklyReportDocument(
    weeklyReportDocument: Record<string, AttributeValue>
  ): WeeklyReportEntity {
    const {
      PK: { S: id },
      startDate: { S: startDate },
      status: { S: status },
      reportImageUrl,
    } = weeklyReportDocument;

    return {
      id: _.split(id, '#')[1],
      startDate,
      status,
      reportImageUrl: reportImageUrl ? reportImageUrl.S : null,
      season: weeklyReportDocument.season?.S || '',
    } as WeeklyReportEntity;
  }
}

export default WeeklyReportService;
