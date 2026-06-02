import { getMethodToUse, MassiveRegisterConfiguration } from '@scifamek-open-source/iraca/web-api';
import { generalMethodMapper } from '@skorify/domain/core';
import { exec } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Builder, BuilderConfiguration } from '../../general/builder';
import { existsFile, toToken, UsecaseInfo, UsecasesInfo } from '../../general/helpers';
import { Class } from '../../general/models';

type Templates = {
  packageTemplate: string;
  sourceCodeTemplate: string;
  tsconfigTemplate: string;
  samTemplate: string;
  helpersTemplate: string;
  pnpmworkspaceTemplate: string;
};

export class ModuleLambdaAWSBuilder extends Builder {
  async build(config: BuilderConfiguration): Promise<void> {
    const allUsecases = await this.getUsecases(config.serverFolder);
    const myFolder = 'module-lambda-aws';
    const templatesFolder = join(config.root, 'src', 'impl', myFolder, 'templates');

    const sourceCodeTemplate = await readFile(
      join(templatesFolder, './lambda-body.template'),
      'utf-8',
    );
    const packageTemplate = await readFile(
      join(templatesFolder, './package.template.json'),
      'utf-8',
    );
    const tsconfigTemplate = await readFile(
      join(templatesFolder, './tsconfig.template.json'),
      'utf-8',
    );
    const pnpmworkspaceTemplate = await readFile(
      join(templatesFolder, './pnpm-workspace.yaml'),
      'utf-8',
    );
    const globalTemplate = await readFile(join(templatesFolder, './global.template.yaml'), 'utf-8');
    const samYMLTemplate = await readFile(join(templatesFolder, './sam.template.yaml'), 'utf-8');
    const eventSamTemplate = await readFile(join(templatesFolder, './event.template.yaml'), 'utf-8');
    const helpersTemplate = await readFile(join(templatesFolder, './helpers.ts'), 'utf-8');

    const repositoriesMapper: any = {
      User: 'users',
      UserEnrollment: 'userEnrollments',
      Tournament: 'tournaments',
      Team: 'teams',
      Match: 'matches',
      Prediction: 'predictions',
      TournamentInstance: 'tournamentInstances',
    };

    // const { fullDistFolder, fullGeneratedFolder } =
    //   await this.createAllModuleFolders(config, usecasesConfig);
    const { fullDistFolder, fullGeneratedFolder } = await this.makeTargetFolders(config);

    await this.createModuleFolders(allUsecases, fullGeneratedFolder, 'usecases');
    const samTemplates: string[] = [];

    const modulesConfig = allUsecases.reduce((acc: any, curr) => {
      if (!acc[curr.module]) {
        acc[curr.module] = {
          modulePascal: curr.modulePascal,
          usecases: [],
        };
      }
      acc[curr.module].usecases.push(curr);
      return acc;
    }, {});
    console.log(modulesConfig);

    for (const module in modulesConfig) {
      let samTemplate = samYMLTemplate;
      let replacedLambdaTemplate = sourceCodeTemplate;
      const injections: string[] = [];
      let imports: string[] = [];
      const fullImports: string[] = [];

      const moduleConfig = modulesConfig[module];
      const usecasesConfig = moduleConfig.usecases;
      const moduleFolder = join(fullGeneratedFolder, module);

      samTemplate = samTemplate
        .replace(new RegExp(toToken('MODULE'), 'g'), module)
        .replace(new RegExp(toToken('MODULE_PASCAL'), 'g'), moduleConfig.modulePascal);

      for (const usecaseConfig of usecasesConfig) {
        const usecaseProperties = await this.getPropertiesByUsecase(usecasesConfig, usecaseConfig);
        const { innerEventSamTemplate } = await this.constructUsecase(
          usecaseProperties,
          usecasesConfig,
          allUsecases,
          usecaseConfig,
          {
            packageTemplate,
            sourceCodeTemplate,
            tsconfigTemplate,
            samTemplate,
            helpersTemplate,
            pnpmworkspaceTemplate,
          },
          fullGeneratedFolder,
          fullDistFolder,
          injections,
          fullImports,
          config.serverFolder,
          eventSamTemplate,
        );
        samTemplate += innerEventSamTemplate;
        // fullImports.push(...imports);
      }

      replacedLambdaTemplate = replacedLambdaTemplate.replace(
        toToken('IMPORTS'),
        fullImports.join('\n'),
      );
      replacedLambdaTemplate = replacedLambdaTemplate.replace(
        toToken('INJECTIONS'),
        injections.join('\n'),
      );
      replacedLambdaTemplate = replacedLambdaTemplate.replace(
        new RegExp(toToken('MODULE_PASCAL'), 'g'),
        `${moduleConfig.modulePascal}`,
      );
      replacedLambdaTemplate = replacedLambdaTemplate.replace(
        new RegExp(toToken('MODULE'), 'g'),
        `${module}`,
      );

      replacedLambdaTemplate = replacedLambdaTemplate.replace(
        new RegExp(toToken('IDENTIFIER'), 'g'),
        `${moduleConfig.modulePascal}`,
      );
      replacedLambdaTemplate = replacedLambdaTemplate.replace(
        new RegExp(toToken('MODULE_SERVICE'), 'g'),
        `${repositoriesMapper[moduleConfig.modulePascal]}`,
      );
      await writeFile(join(moduleFolder, `index.ts`), replacedLambdaTemplate, {
        mode: 0o777,
      });

      samTemplates.push(samTemplate);
      await new Promise<void>((resolve, reject) => {
        console.log(`cd ${moduleFolder} && pnpm i && pnpm run build`);
        exec(`cd ${moduleFolder} && pnpm i && pnpm run build`, (error, stdout, stderr) => {
          if (stdout) console.log(`[${module}] stdout:`, stdout);
          if (stderr) console.error(`[${module}] stderr:`, stderr);
          if (error) {
            reject(new Error(`Build failed for module "${module}": ${error.message}`));
          } else {
            resolve();
          }
        });
      });
    }

    const extraResources = await this.buildExtraResources(
      join(config.root, 'src', 'impl', myFolder),
    );

    const finalYml = globalTemplate.replace(
      toToken('BODY'),
      '  '+extraResources + '\n  ' + samTemplates.join('\n'),
    );

    // await writeFile(join(fullGeneratedFolder, `template.yaml`), finalYml);
    await writeFile(join(fullDistFolder, `template.yaml`), finalYml, {
      mode: 0o777,
    });
    await writeFile(
      join(fullDistFolder, `samconfig.toml`),
      `
version = 0.1

[default.build.parameters]
cached = true
parallel = true

[default.deploy.parameters]
stack_name = "Skorify-Backend-DEV"
resolve_s3 = true
s3_prefix = "skorify-api"
region = "us-east-1"
capabilities = "CAPABILITY_NAMED_IAM"
confirm_changeset = false
disable_rollback = false
image_repositories = []
parameter_overrides = ""

    `,
      {
        mode: 0o777,
      },
    );
  }

  async buildExtraResources(myFolder: string): Promise<string> {
    const extraResources = join(myFolder, 'extra-resources');

    const flatFolders = ['post-confirmation', 'pre-signup'];
    const lambdaNames = ['PostConfirmation', 'PreSignUp'];

    let template = `{{LAMBDA}}Lambda:
    Type: AWS::Serverless::Function
    Properties:
      Handler: {{MODULE}}/index.handler
      Timeout: 60
      Policies:
        - AWSLambdaVPCAccessExecutionRole
        - !Ref AuthLambdasSharedPolicy
      Environment:
        Variables:
          DB_SECRET_ARN: !Ref DbParameterArn
        `;
    let response = [];

    for (const folder of flatFolders) {
      const existsModuleFolder = await existsFile(join(this.generatedFolder, folder));
      if (!existsModuleFolder) {
        await mkdir(join(this.generatedFolder, folder));
      }

      const aaa = join(extraResources, folder);
      const files = await readdir(aaa);

      for (const file of files) {
        const f = join(extraResources, folder, file);
        const content = await readFile(f, 'utf-8');

        await writeFile(join(this.generatedFolder, folder, file), content, {
          mode: 0o777,
        });
      }

      response.push(
        template
          .replace(new RegExp(toToken('LAMBDA'), 'g'), lambdaNames[flatFolders.indexOf(folder)])
          .replace(new RegExp(toToken('MODULE'), 'g'), folder),
      );

      const buildPath = join(this.generatedFolder, folder);
      await new Promise<void>((resolve, reject) => {
        exec(`cd ${buildPath} && pnpm i && pnpm run build`, (error, stdout, stderr) => {
          if (stdout) console.log(`[${folder}] stdout:`, stdout);
          if (stderr) console.error(`[${folder}] stderr:`, stderr);
          if (error) {
            reject(new Error(`Build failed for extra-resource "${folder}": ${error.message}`));
          } else {
            resolve();
          }
        });
      });
    }

    return response.join('\n  ');
  }
  async constructUsecase(
    klass: Class,
    usecasesConfig: UsecasesInfo,
    allUsecases: UsecasesInfo,
    usecaseConfig: UsecaseInfo,
    templates: Templates,
    fullGeneratedFolder: string,
    fullDistFolder: string,
    injections: string[],
    imports: string[],
    serverFolder: string,
    eventSamTemplate: string,
  ): Promise<any> {
    const {
      packageTemplate,
      sourceCodeTemplate,
      tsconfigTemplate,
      helpersTemplate,
      samTemplate,
      pnpmworkspaceTemplate,
    } = templates;

    const source = klass.sourceCode;

    const moduleFolder = join(fullGeneratedFolder, usecaseConfig.module);

    const existsUsecaseFolder = await existsFile(moduleFolder);
    if (!existsUsecaseFolder) {
      await mkdir(moduleFolder);
    }

    await writeFile(
      join(moduleFolder, 'usecases', `${usecaseConfig.kebadUsecaseName}.usecase-impl.ts`),
      source,
      {
        mode: 0o777,
      },
    );

    const originalControllerPath = join(
      serverFolder,
      'src',
      'features',
      usecaseConfig.module,
      'infrastructure',
      'controller.ts',
    );
    const controllerPath = join(moduleFolder, 'infrastructure', 'controller.ts');

    const existsControllerPath = await existsFile(originalControllerPath);
    if (existsControllerPath) {
      console.log(originalControllerPath);

      const controllerContent = await readFile(originalControllerPath, {
        encoding: 'utf-8',
      });
      await writeFile(join(moduleFolder, `controller.ts`), controllerContent, {
        mode: 0o777,
      });
    }

    await writeFile(
      join(moduleFolder, `package.json`),
      packageTemplate
        .replace(toToken('MODULE'), usecaseConfig.module)
        .replace(toToken('USECASE'), usecaseConfig.kebadUsecaseName),
      {
        mode: 0o777,
      },
    );

    await writeFile(join(moduleFolder, `tsconfig.json`), tsconfigTemplate, {
      mode: 0o777,
    });
    await writeFile(join(moduleFolder, `pnpm-workspace.yaml`), pnpmworkspaceTemplate, {
      mode: 0o777,
    });
    await writeFile(join(moduleFolder, `helpers.ts`), helpersTemplate, {
      mode: 0o777,
    });

    const sourceFile = klass.compiledSourceCode;

    const innerEventSamTemplate = eventSamTemplate
      .replace(new RegExp(toToken('MAIN_USECASE'), 'g'), usecaseConfig.usecaseName)
      .replace(
        new RegExp(toToken('KEBAD_MAIN_USECASE'), 'g'),
        `${usecaseConfig.module}/${usecaseConfig.kebadUsecaseName}`,
      )

      .replace(
        new RegExp(toToken('METHOD'), 'g'),
        getMethodToUse(
          generalMethodMapper as MassiveRegisterConfiguration['methodMapper'],
          usecaseConfig.usecaseName,
          'get',
        ),
      );
    const dependencies: string[] = [];

    this.addImport(imports, allUsecases, klass.usecaseName, source);
    this.addImport(imports, allUsecases, `${klass.usecaseName}Impl`, source, 'usecases/');

    klass.attributes.forEach((param) => {
      const { kind, name, type, module } = param;
      let mm = module;
      dependencies.push(type);
      if (kind == 'usecase') {
        if (module != klass.module) {
          this.addImport(imports, allUsecases, type, source);

          const usecase = allUsecases.find((x) => x.usecaseName == type);
          if (usecase) {
            mm = usecase.module;
          }

          injections.push(`

            generate(container, {
                dependencyName: "${type}",
                module: "${mm}",
                methodMapper
              }, headers);
       
            `);
        } else {
          this.addImport(imports, allUsecases, type, source);
        }
      }

      //       else if (type.includes('Contract')) {
      //         this.addImport(imports, allUsecases, type, source);

      //         injections.push(`
      //       container.add({
      //         abstraction: ${type},
      //         implementation: ${usecaseConfig.modulePascal}Repository
      //       });
      // `);
      // }
    });

    injections.push(`
            container.add({
              abstraction: ${klass.usecaseName},
              implementation: ${klass.usecaseName}Impl,
			  dependencies:  [${dependencies.map((d) => `'${d}'`).join(',')}]
            });`);

    return {
      imports,
      moduleFolder,
      innerEventSamTemplate,
    };
  }
}
