import { formatErrorResponse, formatJSONResponse } from '@libs/api-gateway';
import middy from '@middy/core';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpMultipartBodyParser from '@middy/http-multipart-body-parser';
import sharp from 'sharp';
import { Handler } from 'aws-lambda';
import verifyJwtMiddleware from 'src/middlewares/verifyJwtMiddleware';
import uploadFileToDalsamoCdn from '@libs/upload-dalsamo-cdn';
import { JWTPayload } from 'jose';

const uploadRunEntryImage: Handler<{
  auth: { payload: JWTPayload; token: string };
  body: {
    image: {
      filename: string;
      mimetype: string;
      encoding: string;
      truncated: boolean;
      content: string;
    };
  };
}> = async (event) => {
  const { auth } = event;

  try {
    const resizedImage = await sharp(event.body.image.content)
      .resize({ width: 900, withoutEnlargement: true })
      .toBuffer();

    console.log(resizedImage);

    const uploadedImageUrl = await uploadFileToDalsamoCdn({
      file: resizedImage,
      path: `${auth.payload.id}/run-entry/${new Date().valueOf()}.webp`,
    });

    console.log(uploadedImageUrl);

    return formatJSONResponse({
      message: `upload run entry image`,
      imageUrl: uploadedImageUrl,
    });
  } catch (error) {
    console.log(error);
    return formatErrorResponse(500, { message: 'somehow upload image failed' });
  }
};

export const main = middy(uploadRunEntryImage)
  .use(httpHeaderNormalizer())
  .use(httpMultipartBodyParser())
  .use(verifyJwtMiddleware({ passthrough: false }));
