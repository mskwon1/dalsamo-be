import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({ region: 'ap-northeast-2' });

const uploadFileToDalsamoCdn = async (params: {
  file: Buffer;
  path: string;
}) => {
  const { file, path } = params;

  const key = `${process.env.STAGE}/${path}`;

  const putCommand = new PutObjectCommand({
    Body: file,
    Bucket: 'dalsamo-cdn',
    Key: key,
  });

  await client.send(putCommand);

  return `https://dalsamo-cdn.s3.ap-northeast-2.amazonaws.com/${key}`;
};

export default uploadFileToDalsamoCdn;
