import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import * as _ from 'lodash';
import { DBIndexName } from 'src/constants';

class UserService {
  private client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({ region: 'ap-northeast-2' });
  }

  async findAll(params: { limit?: number }): Promise<UserEntity[]> {
    const { limit = 10 } = params;

    const readUsersCommand = new QueryCommand({
      TableName: 'dalsamo-single-table',
      Limit: limit,
      IndexName: DBIndexName.ET_PK,
      KeyConditionExpression: 'partitionKeyName = :pk_val',
      ExpressionAttributeValues: { ':pk_val': { S: 'user' } },
    });

    const { Items: users } = await this.client.send(readUsersCommand);

    return _.map(users, this.parseUserDocument);
  }

  parseUserDocument(userDocument: Record<string, AttributeValue>): UserEntity {
    const {
      PK: { S: id },
      email,
      currentGoal: { N: currentGoal },
      name: { S: name },
    } = userDocument;

    return {
      id,
      email: email?.S ? email.S : null,
      currentGoal: _.toNumber(currentGoal),
      name,
    };
  }
}

export default UserService;
