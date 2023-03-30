import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { DALSAMO_SINGLE_TABLE, DBIndexName } from 'src/constants';
import { v1 as uuidV1 } from 'uuid';

type CreateUserParams = {
  name: string;
  email?: string;
};

class UserService {
  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  private generateId() {
    return uuidV1();
  }

  async findAll(params: { limit?: number }): Promise<UserEntity[]> {
    const { limit = 10 } = params;

    const readUsersCommand = new QueryCommand({
      TableName: `${process.env.STAGE}-dalsamo-single-table`,
      Limit: limit,
      IndexName: DBIndexName.ET_PK,
      KeyConditionExpression: 'EntityType = :pk_val',
      ExpressionAttributeValues: { ':pk_val': { S: 'user' } },
    });

    const { Items: users } = await this.client.send(readUsersCommand);

    return _.map(users, this.parseUserDocument);
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
      },
    });

    await this.client.send(command);

    return userId;
  }

  parseUserDocument(userDocument: Record<string, AttributeValue>): UserEntity {
    const {
      PK: { S: id },
      email,
      currentGoal: { N: currentGoal },
      name: { S: name },
    } = userDocument;

    return {
      id: _.split(id, '#')[1],
      email: email?.S ? email.S : null,
      currentGoal: _.toNumber(currentGoal),
      name,
    };
  }
}

export default UserService;
