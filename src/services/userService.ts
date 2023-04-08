import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  ReturnValue,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { DALSAMO_SINGLE_TABLE, DBIndexName } from 'src/constants';
import { generateKSUID } from 'src/utils';

type CreateUserParams = {
  name: string;
  email?: string;
};

type UpdateUserParams = {
  currentGoal: number;
};

const DEFAULT_GOAL = 7;

class UserService {
  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  private generateId() {
    return generateKSUID();
  }

  async findAll(params: { limit?: number }): Promise<UserEntity[]> {
    const { limit = 10 } = params;

    const readUsersCommand = new QueryCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      Limit: limit,
      IndexName: DBIndexName.ET_PK,
      KeyConditionExpression: 'EntityType = :pk_val',
      ExpressionAttributeValues: { ':pk_val': { S: 'user' } },
    });

    const { Items: users } = await this.client.send(readUsersCommand);

    return _.map(users, UserService.parseUserDocument);
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    const readUsersCommand = new QueryCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      IndexName: DBIndexName.ET_PK,
      KeyConditionExpression: 'EntityType = :pk_val',
      FilterExpression: 'email = :em',
      ExpressionAttributeValues: {
        ':pk_val': { S: 'user' },
        ':em': { S: email },
      },
    });

    const { Items: users } = await this.client.send(readUsersCommand);

    const targetUser = _.head(users);

    if (!targetUser) {
      return null;
    }

    return UserService.parseUserDocument(targetUser);
  }

  async create(params: CreateUserParams) {
    const { name, email } = params;

    const userId = this.generateId();

    const command = new PutItemCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      Item: {
        PK: { S: `user#${userId}` },
        SK: { S: `user#${userId}` },
        EntityType: { S: 'user' },
        name: { S: name },
        email: email ? { S: email } : { NULL: true },
        currentGoal: { N: `${DEFAULT_GOAL}` },
      },
    });

    await this.client.send(command);

    return userId;
  }

  async update(userId: string, params: UpdateUserParams) {
    const { currentGoal } = params;

    const command = new UpdateItemCommand({
      TableName: DALSAMO_SINGLE_TABLE,
      Key: {
        PK: { S: `user#${userId}` },
        SK: { S: `user#${userId}` },
      },
      UpdateExpression: 'SET currentGoal = :cg',
      ExpressionAttributeValues: {
        ':cg': { N: `${currentGoal}` },
      },
      ReturnValues: ReturnValue.ALL_NEW,
    });

    const { Attributes } = await this.client.send(command);

    return UserService.parseUserDocument(Attributes);
  }

  static parseUserDocument(
    userDocument: Record<string, AttributeValue>
  ): UserEntity {
    const {
      PK: { S: id },
      email,
      currentGoal: { N: currentGoal },
      name: { S: name },
    } = userDocument;

    return {
      id: _.split(id, '#')[1],
      currentGoal: _.toNumber(currentGoal),
      name,
      email: email?.S ? email.S : null,
    };
  }
}

export default UserService;
