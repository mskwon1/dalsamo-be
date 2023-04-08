export enum DBIndexName {
  ET_PK = 'et_pk',
  GSI_SK = 'gsi_sk',
}

export const DALSAMO_SINGLE_TABLE = `${process.env.STAGE}-dalsamo-single-table`;

export const MAX_GOAL_DISTANCE = 14;

export const DALSAMO_WEB_DOMAIN =
  process.env.STAGE === 'dev'
    ? 'dalsamo-dev.mskwon.click'
    : 'dalsamo.mskwon.click';
