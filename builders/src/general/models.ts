import { SingleLambdaAWSBuilder } from "../single-lambda-aws";

export type ValidBuilderNames = "single-lambda-aws" | "module-lambda-aws";
export type BuilderNamesMapper = {
  [index in ValidBuilderNames]: SingleLambdaAWSBuilder;
};
