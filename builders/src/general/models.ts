import { LambdaAWSBuilder } from "../lambda-aws";

export type ValidBuilderNames = "lambda";
export type BuilderNamesMapper = {
  [index in ValidBuilderNames]: LambdaAWSBuilder;
};
