import { formatJSONResponse } from '@libs/api-gateway';
import middy from '@middy/core';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpMultipartBodyParser from '@middy/http-multipart-body-parser';
import sharp from 'sharp';
import { parseRundayImage } from '@libs/parse-runday-image';
import { createWorker } from 'tesseract.js';

const analyzeCaptureImage = async (event) => {
  try {
    console.log(event);
    console.log(event.body);

    console.log(Buffer.from(event.body.image.content).toString('base64'));

    const resizedImage = await sharp(event.body.image.content)
      .resize({ width: 648 })
      .toBuffer();

    console.log(resizedImage);

    const worker = await createWorker();
    const parsedData = await parseRundayImage(worker, resizedImage);

    console.log(parsedData);

    return formatJSONResponse({
      message: `test analyze capture image`,
      parsedData,
    });
  } catch (error) {
    console.log(error);
    return formatJSONResponse({ message: 'somehow failed' });
  }
};

export const main = middy(analyzeCaptureImage)
  .use(httpHeaderNormalizer())
  .use(httpMultipartBodyParser());
