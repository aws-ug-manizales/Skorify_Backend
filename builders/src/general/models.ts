import { SingleLambdaAWSBuilder } from "../single-lambda-aws";

export type ValidBuilderNames = "single-lambda";
export type BuilderNamesMapper = {
  [index in ValidBuilderNames]: SingleLambdaAWSBuilder;
};
