import { formatErrorResponse } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import FineService from 'src/services/fineService';
import { Handler } from 'aws-lambda';
import _ from 'lodash';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const getFineStatus: Handler = async () => {
  const fineService = new FineService(client);

  try {
    const fines = await fineService.findAll();

    const status = _.chain(fines)
      .groupBy(({ userId }) => userId)
      .mapValues((fineGroup) => {
        return {
          userId: _.head(fineGroup).userId,
          userName: _.head(fineGroup).userName,
          sum: _.sumBy(fineGroup, 'value'),
        };
      })
      .values()
      .orderBy(['sum'], ['desc'])
      .value();

    console.log(status);

    return formatJSONResponse({
      message: `fine status retrieved`,
      status,
    });
  } catch (error) {
    console.log(error);
    return formatErrorResponse(500, { message: 'fine status retrieve failed' });
  }
};

export const main = middyfy(getFineStatus);
