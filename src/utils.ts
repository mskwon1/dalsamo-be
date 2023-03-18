import { AWS, AwsIamPolicyStatements } from '@serverless/typescript';

export type LambdaFunctionEntry = AWS['functions'][keyof AWS['functions']] & {
  iamRoleStatements?: AwsIamPolicyStatements;
};
