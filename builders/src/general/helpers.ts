import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
export async function getUsecases(serverFolder: string) {
  const featuresFolder = join(serverFolder, "src", "features");
  const files = await readdir(featuresFolder, {
    recursive: true,
  });

  const pattern = /([\w-]+)\\usecases\\([\w-]+)\.usecase-impl\.ts/;

  const validFiles = files
    .map((f) => pattern.exec(f))
    .filter((x) => x !== null)
    .map((x: RegExpExecArray) => ({
      module: x[1],
      modulePascal: kebabToPascal(x[1]),

      kebadUsecaseName: x[2],
      usecaseName: kebabToPascal(x[2]) + "Usecase",
      path: join(featuresFolder, x[0]),
    }));
  return validFiles;
}

function kebabToCamel(str: string): string {
  return str.toLowerCase().replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function kebabToPascal(str: string): string {
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
