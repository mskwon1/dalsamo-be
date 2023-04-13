import {
  JWTVerifiedBody,
  ValidatedEventAPIGatewayProxyEvent,
  formatErrorResponse,
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import schema from './schema';
import RunEntryService from 'src/services/runEntryService';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import verifyJwtMiddleware from 'src/middlewares/verifyJwtMiddleware';
import UserService from 'src/services/userService';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const handler: ValidatedEventAPIGatewayProxyEvent<
  typeof schema,
  JWTVerifiedBody
> = async (event) => {
  const {
    pathParameters: { runEntryId },
  } = event;
  const { weeklyReportId, runDistance, imageUrls } = event.body;
  const { payload } = event.auth;

  const userService = new UserService(client);
  const runEntryService = new RunEntryService(client);

  try {
    const currentUser = await userService.findOneById(payload.id as string);

    if (!currentUser) {
      return formatErrorResponse(401, { message: 'request user not found' });
    }

    const targetEntry = await runEntryService.findOneByKey({
      runEntryId,
      weeklyReportId,
    });

    if (!targetEntry) {
      return formatErrorResponse(404, { message: 'run entry not found' });
    }

    if (
      targetEntry.userId !== payload.id ||
      !currentUser.roles.includes('admin')
    ) {
      return formatErrorResponse(403, { message: 'not authenticated' });
    }

    const updatedEntry = await runEntryService.update(
      { runEntryId, weeklyReportId },
      { runDistance, imageUrls }
    );

    return formatJSONResponse({
      message: `run entry updated - ${runEntryId}`,
      runEntry: updatedEntry,
    });
  } catch (error) {
    console.log(error);
    return formatErrorResponse(500, { message: 'run entry update failed' });
  }
};

export const main = middyfy(handler)
  .use(httpHeaderNormalizer())
  .use(verifyJwtMiddleware({ passthrough: false }));
