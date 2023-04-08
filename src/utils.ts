import { AWS, AwsIamPolicyStatements } from '@serverless/typescript';
import KSUID from 'ksuid';

export type LambdaFunctionEntry = AWS['functions'][keyof AWS['functions']] & {
  iamRoleStatements?: AwsIamPolicyStatements;
};

export const generateKSUID = () => {
  return KSUID.randomSync().string;
};
