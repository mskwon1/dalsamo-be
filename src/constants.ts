export enum DBIndexName {
  ET_PK = 'et_pk',
  GSI_SK = 'gsi_sk',
}

export const DALSAMO_SINGLE_TABLE = `${process.env.STAGE}-dalsamo-single-table`;
