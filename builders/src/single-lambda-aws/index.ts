import { existsFile, getUsecases, toToken } from "../general/helpers";
import { Builder, BuilderConfiguration } from "../general/builder";
import { pathToFileURL } from "node:url";
import * as ts from "typescript";
import { mkdir, statfs, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  getMethodToUse,
  MassiveRegisterConfiguration,
} from "@scifamek-open-source/iraca/web-api";
import { generalMethodMapper } from "@skorify/domain/core";
import { exec } from "node:child_process";
type UsecaseInfo = {
  module: string;
  modulePascal: string;
  usecaseName: string;
  kebadUsecaseName: string;
  path: string;
};
type UsecasesInfo = UsecaseInfo[];
type Templates = {
  packageTemplate: string;
  sourceCodeTemplate: string;
  tsconfigTemplate: string;
  samTemplate: string;
  helpersTemplate: string;
  repositoryTemplate: string;
};
export class SingleLambdaAWSBuilder extends Builder {
  generatedFolder = "generated";
  distFolder = "dist";
  async build(config: BuilderConfiguration): Promise<void> {
    const usecases = await getUsecases(config.serverFolder);

    const myFolder = "single-lambda-aws";
    const templatesFolder = join(config.root, "src", myFolder, "templates");
    const sourceCodeTemplate = await readFile(
      join(templatesFolder, "./lambda-body.template"),
      "utf-8",
    );
    const packageTemplate = await readFile(
      join(templatesFolder, "./package.template.json"),
      "utf-8",
    );
    const tsconfigTemplate = await readFile(
      join(templatesFolder, "./tsconfig.template.json"),
      "utf-8",
    );
    const samTemplate = await readFile(
      join(templatesFolder, "./sam.template.yaml"),
      "utf-8",
    );
    const helpersTemplate = await readFile(
      join(templatesFolder, "./helpers.ts"),
      "utf-8",
    );
    const repositoryTemplate = await readFile(
      join(templatesFolder, "./base.repository.ts"),
      "utf-8",
    );

    const fullGeneratedFolder = join(config.root, this.generatedFolder);
    const fullDistFolder = join(config.root, this.distFolder);
    const existsGenerated = await existsFile(fullGeneratedFolder);
    const exists = await existsFile(fullDistFolder);
    if (!existsGenerated) {
      // await rm(fullDistFolder, {
      //   force: true,
      //   recursive: true,
      // });
      await mkdir(fullGeneratedFolder);
    }
    if (!exists) {
      // await rm(fullDistFolder, {
      //   force: true,
      //   recursive: true,
      // });
      await mkdir(fullDistFolder);
    }

    await this.createModuleFolders(usecases, fullGeneratedFolder);
    await this.createModuleFolders(usecases, fullDistFolder);
    const promises = [];
    for (const usecaseConfig of usecases) {
      const promise = this.constructUsecase(
        usecases,
        usecaseConfig,
        {
          packageTemplate,
          sourceCodeTemplate,
          tsconfigTemplate,
          samTemplate,
          helpersTemplate,
          repositoryTemplate,
        },
        fullGeneratedFolder,
        fullDistFolder,
      );

      promises.push(promise);
    }
    const resourcesYML = await Promise.all(promises);

    await writeFile(
      join(fullDistFolder, `template.yaml`),
      `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:

${resourcesYML.join("\n")}`,
    );
  }

  async createModuleFolders(usecases: UsecasesInfo, fullDistFolder: string) {
    for (const usecaseConfig of usecases) {
      const moduleFolder = join(fullDistFolder, usecaseConfig.module);

      const existsModuleFolder = await existsFile(moduleFolder);
      if (!existsModuleFolder) {
        await mkdir(moduleFolder);
      }
    }
  }
  async constructUsecase(
    usecasesConfig: UsecasesInfo,
    usecaseConfig: UsecaseInfo,
    templates: Templates,
    fullGeneratedFolder: string,
    fullDistFolder: string,
  ): Promise<string> {
    const {
      packageTemplate,
      sourceCodeTemplate,
      tsconfigTemplate,
      helpersTemplate,
      samTemplate,
      repositoryTemplate,
    } = templates;
    let myYamlTemplate = samTemplate;

    const source = await readFile(usecaseConfig.path, "utf-8");

    const injections: string[] = [];
    const moduleFolder = join(fullGeneratedFolder, usecaseConfig.module);

    const usecaseFolder = join(moduleFolder, usecaseConfig.kebadUsecaseName);
    const existsUsecaseFolder = await existsFile(usecaseFolder);
    if (!existsUsecaseFolder) {
      await mkdir(usecaseFolder);
    }

    await writeFile(
      join(usecaseFolder, `${usecaseConfig.kebadUsecaseName}.usecase-impl.ts`),
      source,
    );
    await writeFile(
      join(usecaseFolder, `package.json`),
      packageTemplate
        .replace(toToken("MODULE"), usecaseConfig.module)
        .replace(toToken("USECASE"), usecaseConfig.kebadUsecaseName),
    );
    await writeFile(join(usecaseFolder, `tsconfig.json`), tsconfigTemplate);
    await writeFile(join(usecaseFolder, `helpers.ts`), helpersTemplate);
    await writeFile(
      join(usecaseFolder, `${usecaseConfig.module}.repository.ts`),
      repositoryTemplate.replace(toToken("ENTITY"), usecaseConfig.modulePascal),
    );

    let imports: string[] = [];
    const sourceFile = ts.createSourceFile(
      usecaseConfig.path,
      source,
      ts.ScriptTarget.ES2017,
      true,
    );

    let replacedLambdaTemplate = sourceCodeTemplate;

    for (const node of this.walk(sourceFile)) {
      if (ts.isClassDeclaration(node)) {
        const ctr = node.members.find(ts.isConstructorDeclaration);

        if (ctr) {
          const classNode = ctr.parent;

          if (ts.isClassDeclaration(classNode)) {
            const className = classNode.name?.text;
            this.addImport(imports, usecasesConfig, className!, source);
            replacedLambdaTemplate = replacedLambdaTemplate.replace(
              toToken("MAIN_USECASE_IMPL"),
              className!,
            );
          }

          const heritage = node.heritageClauses;
          if (heritage) {
            const parentClause = heritage.find(
              (x) => x.token == ts.SyntaxKind.ExtendsKeyword,
            );
            if (parentClause) {
              const parent = parentClause.types[0];
              const usecaseAbstractionClass = parent.expression.getText();

              this.addImport(
                imports,
                usecasesConfig,
                usecaseAbstractionClass,
                source,
              );

              replacedLambdaTemplate = replacedLambdaTemplate.replace(
                new RegExp(toToken("MAIN_USECASE"), "g"),
                usecaseAbstractionClass,
              );

              myYamlTemplate = samTemplate
                .replace(
                  new RegExp(toToken("MAIN_USECASE"), "g"),
                  usecaseAbstractionClass.replace("Usecase", ""),
                )
                .replace(
                  new RegExp(toToken("KEBAD_MAIN_USECASE"), "g"),
                  `${usecaseConfig.module}/${usecaseConfig.kebadUsecaseName}`,
                )

                .replace(
                  new RegExp(toToken("METHOD"), "g"),
                  getMethodToUse(
                    generalMethodMapper as MassiveRegisterConfiguration["methodMapper"],
                    usecaseConfig.usecaseName,
                    "get",
                  ),
                );
            }
          }

          const dependencies: string[] = [];
          ctr.parameters.forEach((param) => {
            const name = param.name.getText();
            const type = param.type?.getText() ?? "any";
            dependencies.push(type);
            this.addImport(imports, usecasesConfig, type, source);
            if (type.includes("Usecase")) {
              injections.push(`
      container.add({
        abstraction: ${type},
        implementation: generate({
          dependencyName: "${type}",
          methodMapper
        }),
      });
                `);
            } else if (type.includes("Contract")) {
              injections.push(`
      container.add({
        abstraction: ${type},
        implementation: ${usecaseConfig.modulePascal}Repository
      });
                `);
            }
          });

          replacedLambdaTemplate = replacedLambdaTemplate.replace(
            toToken("IMPORTS"),
            imports.join("\n"),
          );
          replacedLambdaTemplate = replacedLambdaTemplate.replace(
            toToken("INJECTIONS"),
            injections.join("\n"),
          );

          replacedLambdaTemplate = replacedLambdaTemplate.replace(
            new RegExp(toToken("IDENTIFIER"), "g"),
            `${usecaseConfig.modulePascal}`,
          );
          replacedLambdaTemplate = replacedLambdaTemplate.replace(
            new RegExp(toToken("MODULE_PASCAL"), "g"),
            `${usecaseConfig.modulePascal}`,
          );
          replacedLambdaTemplate = replacedLambdaTemplate.replace(
            new RegExp(toToken("MODULE"), "g"),
            `${usecaseConfig.module}`,
          );

          replacedLambdaTemplate = replacedLambdaTemplate.replace(
            toToken("MAIN_USECASE_DEPENDENCIES"),
            `[${dependencies.join(",")}]`,
          );

          await writeFile(
            join(usecaseFolder, `index.ts`),
            replacedLambdaTemplate,
          );

          const n = new Promise<void>((resolve, reject) => {
            exec(`cd ${usecaseFolder} && pnpm run build `, () => {
              resolve();
            });
          });
          await n;
        }
      }
    }
    return myYamlTemplate;
  }
  addImport(
    imports: string[],
    usecases: UsecasesInfo,
    myClass: string,
    impl: string,
  ) {
    if (myClass.includes("UsecaseImpl")) {
      const empty = myClass.replace("Impl", "");
      const usecase = usecases.find((x) => x.usecaseName == empty);
      if (usecase) {
        imports.push(
          `import {${myClass}} from './${usecase.kebadUsecaseName}.usecase-impl';`,
        );
      }
    } else if (myClass.includes("Usecase")) {
      const usecase = usecases.find((x) => x.usecaseName == myClass);

      if (usecase) {
        imports.push(
          `import {${myClass}} from '@skorify/domain/${usecase.module}';`,
        );
      }
    } else {
      const p = new RegExp(
        "import\\s*\\{[^}]*\\b" +
          myClass +
          `\\b[^}]*\\}\\s*from\\s*["']([^"']+)["'];`,
      );
      const result = p.exec(impl);
      if (result) {
        const fromPath = result[1];
        imports.push(`import {${myClass}} from '${fromPath}';`);
      }
    }
  }

  *walk(node: ts.Node): Generator<ts.Node> {
    yield node;
    for (const child of node.getChildren()) {
      yield* this.walk(child);
    }
  }
}
