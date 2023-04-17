import { JWTVerifiedBody, formatErrorResponse } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Handler } from 'aws-lambda';
import _ from 'lodash';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import verifyJwtMiddleware from 'src/middlewares/verifyJwtMiddleware';
import RunEntryService from 'src/services/runEntryService';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const getUserRunEntries: Handler<JWTVerifiedBody> = async (event) => {
  const { auth } = event;

  const runEntryService = new RunEntryService(client);

  try {
    const runEntries = await runEntryService.findAllByUser(
      auth.payload.id as string
    );

    console.log(runEntries);

    return formatJSONResponse({
      message: `user run entries retrieved`,
      runEntries: _.orderBy(runEntries, ['weeklyReportId'], ['asc']),
    });
  } catch (error) {
    console.log(error);
    return formatErrorResponse(500, {
      message: 'user run entries retrieve failed',
    });
  }
};

export const main = middyfy(getUserRunEntries)
  .use(httpHeaderNormalizer())
  .use(verifyJwtMiddleware({ passthrough: false }));
