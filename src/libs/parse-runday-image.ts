import { createWorker } from 'tesseract.js';

const USERNAMES_RECTANGLE_PRESET = {
  left: 170,
  width: 300,
  top: 650,
  height: 700,
};

const DISTANCES_RECTANGLE_PRESET = {
  left: 500,
  width: 150,
  top: 650,
  height: 700,
};

export const parseRundayImage = async (
  worker: Tesseract.Worker,
  file: Buffer
) => {
  await worker.loadLanguage('eng+kor');
  await worker.initialize('eng+kor');

  const {
    data: { text: userNamesText },
  } = await worker.recognize(file, {
    rectangle: USERNAMES_RECTANGLE_PRESET,
  });

  const {
    data: { text: distancesText },
  } = await worker.recognize(file, {
    rectangle: DISTANCES_RECTANGLE_PRESET,
  });

  const userNames = getCompatRecords(userNamesText);
  const distances = getCompatRecords(distancesText).map((text) =>
    text.replaceAll('km', '')
  );

  await worker.terminate();

  return _.map(userNames, (rawName, index) => {
    return {
      rawName,
      distance: _.toNumber(distances[index]),
    };
  });
};

const getCompatRecords = (target: string) => {
  return _.chain(target)
    .split('\n')
    .map((record) => record.split(' ').join('').replace(' ', ''))
    .compact()
    .value();
};
