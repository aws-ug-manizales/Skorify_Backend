import { stat } from "node:fs/promises";

export type UsecaseInfo = {
  module: string;
  modulePascal: string;
  usecaseName: string;
  kebadUsecaseName: string;
  path: string;
};
export type UsecasesInfo = UsecaseInfo[];

export function kebabToCamel(str: string): string {
  return str.toLowerCase().replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export function kebabToPascal(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^\w|-\w)/g, (match) => match.replace("-", "").toUpperCase());
}

export function toToken(tokenName: string) {
  return `{{${tokenName}}}`;
}
export async function existsFile(path: string): Promise<boolean> {
  try {
    const existsModuleFolder = await stat(path);
    return true;
  } catch (error) {
    return false;
  }
}
