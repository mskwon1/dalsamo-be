export enum DBIndexName {
  ET_PK = 'et_pk',
  ET_GSI = 'et_gsi',
  GSI_SK = 'gsi_sk',
}

export const DALSAMO_SINGLE_TABLE = `${process.env.STAGE}-dalsamo-single-table`;

export const MAX_GOAL_DISTANCE = 14;

export const BATCH_WRITE_MAX_ELEMENTS = 25;
