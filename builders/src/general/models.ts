import ts from "typescript";
import { Builder } from "./builder";
import { UsecaseInfo } from "./helpers";

export type ValidBuilderNames = "single-lambda-aws" | "module-lambda-aws";
export type BuilderNamesMapper = {
  [index in ValidBuilderNames]: Builder;
};

export interface Import {
  relativePath: string;
  name: string;
}

export interface Attribute {
  name: string;
  type: string;
  kind: "usecase" | "shared";
  module?: string;
}
export interface Class extends UsecaseInfo {
  sourceCode: string;
  compiledSourceCode: ts.SourceFile;
  name: string;
  parent?: string;
  attributes: Attribute[];
  imports: Import[];
}
