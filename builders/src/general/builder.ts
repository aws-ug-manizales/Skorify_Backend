import { join } from "node:path";
import {
  existsFile,
  kebabToPascal,
  UsecaseInfo,
  UsecasesInfo,
} from "./helpers";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import * as ts from "typescript";
import { Attribute, Class } from "./models";
import { exec } from "node:child_process";

export interface BuilderConfiguration {
  root: string;
  serverFolder: string;
}
export abstract class Builder {
  generatedFolder = "generated";
  distFolder = "dist";
  abstract build(config: BuilderConfiguration): Promise<void>;

  async getPropertiesByUsecase(
    usecasesConfig: UsecasesInfo,

    usecaseConfig: UsecaseInfo,
  ) {
    const source = await readFile(usecaseConfig.path, "utf-8");

    let imports: string[] = [];
    const sourceFile = ts.createSourceFile(
      usecaseConfig.path,
      source,
      ts.ScriptTarget.ES2017,
      true,
    );

    const myClass: Class = {
      ...usecaseConfig,
      attributes: [],
      imports: [],
      sourceCode: source,
      compiledSourceCode: sourceFile,
      name: "",
    };

    for (const node of this.walk(sourceFile)) {
      if (ts.isClassDeclaration(node)) {
        const ctr = node.members.find(ts.isConstructorDeclaration);

        if (ctr) {
          const classNode = ctr.parent;

          if (ts.isClassDeclaration(classNode)) {
            const className = classNode.name?.text;
            // this.addImport(imports, usecasesConfig, className!, source);

            if (className) {
              myClass.name = className;
            }
          }

          const heritage = node.heritageClauses;
          if (heritage) {
            const parentClause = heritage.find(
              (x) => x.token == ts.SyntaxKind.ExtendsKeyword,
            );
            if (parentClause) {
              const parent = parentClause.types[0];
              const usecaseAbstractionClass = parent.expression.getText();

              //         if (myClass.includes("Usecase")) {
              // const usecase = usecases.find((x) => x.usecaseName == myClass);

              // if (usecase) {
              //   imports.push(
              //     `import {${myClass}} from '@skorify/domain/${usecase.module}';`,
              //   );
              // }
              // this.addImport(
              //   imports,
              //   usecasesConfig,
              //   usecaseAbstractionClass,
              //   source,
              // );
            }
          }

          const dependencies: string[] = [];
          ctr.parameters.forEach((param) => {
            const name = param.name.getText();
            const type = param.type?.getText() ?? "any";

            const attr: Attribute = {
              name,
              type,
              kind: "shared",
            };

            if (type.includes("Usecase")) {
              attr.kind = "usecase";
            }
            const aa = usecasesConfig.find((x) => x.usecaseName == type);
            if (aa) {
              attr.module = aa.module;
            }
            myClass.attributes.push(attr);

            dependencies.push(type);
            // this.addImport(imports, usecasesConfig, type, source);
          
            
          });
        }
      }
    }
    return myClass;
  }
  *walk(node: ts.Node): Generator<ts.Node> {
    yield node;
    for (const child of node.getChildren()) {
      yield* this.walk(child);
    }
  }
  addImport(
    imports: string[],
    usecases: UsecasesInfo,
    myClass: string,
    impl: string,
  ) {
    let toAdd = "";

    if (myClass.includes("UsecaseImpl")) {
      const empty = myClass.replace("Impl", "");
      const usecase = usecases.find((x) => x.usecaseName == empty);
      if (usecase) {
        toAdd = `import {${myClass}} from './${usecase.kebadUsecaseName}.usecase-impl';`;
      }
    } else if (myClass.includes("Usecase")) {
      const usecase = usecases.find((x) => x.usecaseName == myClass);

      if (usecase) {
        toAdd = `import {${myClass}} from '@skorify/domain/${usecase.module}';`;
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
        toAdd = `import {${myClass}} from '${fromPath}';`;
      }
    }
    if (toAdd) {
      const idex = imports.indexOf(toAdd);
      if (idex == -1) {
        imports.push(toAdd);
      }
    }
  }
  async getUsecases(serverFolder: string): Promise<UsecasesInfo> {
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

  async createModuleFolders(
    usecases: UsecasesInfo,
    fullTargetFolder: string,
    innerFolder?: string,
  ) {
    for (const usecaseConfig of usecases) {
      const moduleFolder = join(fullTargetFolder, usecaseConfig.module);

      const existsModuleFolder = await existsFile(moduleFolder);
      if (!existsModuleFolder) {
        await mkdir(moduleFolder);
      }
      if (innerFolder) {
        const x = join(moduleFolder, innerFolder);
        const xx = await existsFile(x);
        if (!xx) {
          await mkdir(x);
        }
      }
    }
  }
  async makeTargetFolders(config: BuilderConfiguration) {
    const fullGeneratedFolder = join(config.root, this.generatedFolder);
    const fullDistFolder = join(config.root, this.distFolder);
    const existsGenerated = await existsFile(fullGeneratedFolder);
    const exists = await existsFile(fullDistFolder);
    if (!existsGenerated) {
      await rm(fullDistFolder, {
        force: true,
        recursive: true,
      });
      await mkdir(fullGeneratedFolder);
    }
    if (!exists) {
      await rm(fullDistFolder, {
        force: true,
        recursive: true,
      });
      await mkdir(fullDistFolder);
    }

    return {
      fullDistFolder,
      fullGeneratedFolder,
    };
  }
  async createAllModuleFolders(
    config: BuilderConfiguration,
    usecases: UsecasesInfo,
  ) {
    const { fullDistFolder, fullGeneratedFolder } =
      await this.makeTargetFolders(config);

    await this.createModuleFolders(usecases, fullGeneratedFolder);
    await this.createModuleFolders(usecases, fullDistFolder);
    return {
      fullDistFolder,
      fullGeneratedFolder,
    };
  }
}
