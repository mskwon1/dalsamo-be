import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import RunEntryService from 'src/services/runEntryService';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });

const handler = async () => {
  const runEntryService = new RunEntryService(client);

  try {
    const runEntries = await runEntryService.findAll();
    const runEntriesWithSeason = runEntries.map((entry) => {
      return {
        ...entry,
        season: '2023',
      };
    });

    console.log(runEntries);

    const { createdItemsCount } = await runEntryService.createOrUpdateMany(
      runEntriesWithSeason
    );

    console.log(createdItemsCount);
  } catch (error) {
    console.log(error);
  }
};

export const main = handler;
