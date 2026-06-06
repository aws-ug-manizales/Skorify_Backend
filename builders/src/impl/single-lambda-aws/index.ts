import {
  getMethodToUse,
  MassiveRegisterConfiguration,
} from "@scifamek-open-source/iraca/web-api";
import { generalMethodMapper } from "@skorify/domain/core";
import { exec } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as ts from "typescript";
import { Builder, BuilderConfiguration } from "../../general/builder";
import {
  existsFile,
  toToken,
  UsecaseInfo,
  UsecasesInfo,
} from "../../general/helpers";
import { logger } from "../../general/logger";

type Templates = {
  packageTemplate: string;
  sourceCodeTemplate: string;
  tsconfigTemplate: string;
  samTemplate: string;
  helpersTemplate: string;
  repositoryTemplate: string;
};
export class SingleLambdaAWSBuilder extends Builder {
  async build(config: BuilderConfiguration, env: string): Promise<void> {
    const usecases = await this.getUsecases(config.serverFolder);

    logger.debug("Single Lambda usecases discovered", {
      usecaseCount: usecases.length,
      modules: [...new Set(usecases.map((usecase) => usecase.module))],
    });

    const myFolder = "single-lambda-aws";

    const templatesFolder = join(
      config.root,
      "src",
      "impl",
      myFolder,
      "templates",
    );
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

    const { fullDistFolder, fullGeneratedFolder } =
      await this.createAllModuleFolders(config, usecases);
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
}
