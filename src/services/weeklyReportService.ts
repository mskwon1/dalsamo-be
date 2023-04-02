import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  PutRequest,
  QueryCommand,
  ReturnConsumedCapacity,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { DALSAMO_SINGLE_TABLE, DBIndexName } from 'src/constants';
import { v1 as uuidV1 } from 'uuid';
import RunEntryService from './runEntryService';

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

    const runEntries = _.chain(Items)
      .filter((item) => item.EntityType?.S === 'runEntry')
      .map(RunEntryService.parseRunEntryDocument)
      .value();

    return {
      ...WeeklyReportService.parseWeeklyReportDocument(weeklyReport),
      runEntries,
    };
  }

  async findAll(params: { limit?: number }): Promise<WeeklyReportEntity[]> {
    const { limit = 10 } = params;

    const readWeeklyReportsCommand = new QueryCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      IndexName: DBIndexName.ET_PK,
      Limit: limit,
      KeyConditionExpression: 'EntityType = :pk_val',
      ExpressionAttributeValues: { ':pk_val': { S: 'weeklyReport' } },
    });

    const { Items: weeklyReports } = await this.client.send(
      readWeeklyReportsCommand
    );

    return _.map(weeklyReports, WeeklyReportService.parseWeeklyReportDocument);
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

  static parseWeeklyReportDocument(
    weeklyReportDocument: Record<string, AttributeValue>
  ): WeeklyReportEntity {
    const {
      PK: { S: id },
      startDate: { S: startDate },
      status: { S: status },
    } = weeklyReportDocument;

    return {
      id: _.split(id, '#')[1],
      startDate,
      status,
    } as WeeklyReportEntity;
  }
}

export default WeeklyReportService;
