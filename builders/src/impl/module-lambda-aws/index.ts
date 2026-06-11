import { getMethodToUse, MassiveRegisterConfiguration } from '@scifamek-open-source/iraca/web-api';
import { generalMethodMapper } from '@skorify/domain/core';
import { exec } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Builder, BuilderConfiguration } from '../../general/builder';
import { existsFile, toToken, UsecaseInfo, UsecasesInfo } from '../../general/helpers';
import { logger } from '../../general/logger';
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
  async build(config: BuilderConfiguration, env: string): Promise<void> {
    const { SKO_PARAMETERS } = process.env;
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
    const alarmsYMLTemplate = await readFile(
      join(templatesFolder, './alarms.template.yaml'),
      'utf-8',
    );
    const eventSamTemplate = await readFile(
      join(templatesFolder, './event.template.yaml'),
      'utf-8',
    );
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
    logger.debug('Module Lambda configuration created', {
      moduleCount: Object.keys(modulesConfig).length,
      modules: Object.entries(modulesConfig).map(([module, moduleConfig]: [string, any]) => ({
        module,
        usecaseCount: moduleConfig.usecases.length,
      })),
    });

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
          env
        );
        samTemplate += innerEventSamTemplate;
        // fullImports.push(...imports);
      }

      samTemplate += alarmsYMLTemplate.replace(
        new RegExp(toToken('MODULE_PASCAL'), 'g'),
        moduleConfig.modulePascal,
      );

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
        logger.info('Building generated Lambda module', { module, moduleFolder });
        exec(`cd ${moduleFolder} && pnpm i && pnpm run build`, (error, stdout, stderr) => {
          if (stdout) {
            logger.debug('Generated Lambda module build output', {
              module,
              output: stdout.trim(),
            });
          }
          if (stderr) {
            logger.warn('Generated Lambda module build stderr', {
              module,
              output: stderr.trim(),
            });
          }
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
      '  ' + extraResources + '\n  ' + samTemplates.join('\n'),
    );

    // await writeFile(join(fullGeneratedFolder, `template.yaml`), finalYml);
    await writeFile(join(fullDistFolder, `template.yaml`), finalYml, {
      mode: 0o777,
    });
    // Config por ambiente. Cada uno genera su seccion [<env>.deploy.parameters]
    // en el samconfig; se elige en el deploy con `sam deploy --config-env <env>`.
    // GoogleClientSecret NO va aqui: lo resuelve el template desde Secrets Manager
    // (skorify/<env>/google-client-secret).
    const envConfigs: Record<
      string,
      {
        account: string;
        vpcId: string;
        cognitoDomain: string;
        googleClientId: string;
        callbackUrls: string;
        domainName: string;
        certificateArn: string;
        routeAuthorization: string;
      }
    > = {
      dev: {
        account: '968306633562',
        vpcId: 'vpc-0b9b441356f809cd7',
        cognitoDomain: 'skorify-dev',
        googleClientId: '80003356036-otakdpito4rjt32oqpj0phv3mudknnqi.apps.googleusercontent.com',
        callbackUrls:
          'http://localhost:3000/auth/callback,https://skorify-dev.cloud-manizales.com/auth/callback',
        domainName: 'api.skorify-dev.cloud-manizales.com',
        certificateArn:
          'arn:aws:acm:us-east-1:968306633562:certificate/44456e61-449b-40f8-874d-734f97e9230c',
        routeAuthorization: JSON.stringify({
          "/prediction/edit-prediction-directly": [{"methods":["PATCH"],"allowedGroups":["admins"]}],
          "/match/close-match": [{"methods":["POST"],"allowedGroups":["admins"]}]
        }),
      },
      prod: {
        account: '151646410766',
        vpcId: 'vpc-08506af24531f2dcb',
        cognitoDomain: 'skorify',
        googleClientId: '80003356036-ks13nilig3bvel2qt9icrapsv2325is5.apps.googleusercontent.com',
        callbackUrls: 'https://skorify.cloud-manizales.com/auth/callback',
        domainName: 'api.skorify.cloud-manizales.com',
        certificateArn:
          'arn:aws:acm:us-east-1:151646410766:certificate/5a4624ab-b3ff-4703-9b8a-a792c7fa094f',
        routeAuthorization: JSON.stringify({
          "/prediction/edit-prediction-directly": [{"methods":["PATCH"],"allowedGroups":["admins"]}],
          "/match/close-match": [{"methods":["POST"],"allowedGroups":["admins"]}]
        }),
      },
    };

    const deploySection = (env: string, c: (typeof envConfigs)[string]) =>
      `[${env}.deploy.parameters]
stack_name = "Skorify-Backend-${env.toUpperCase()}"
s3_bucket = "cdk-hnb659fds-assets-${c.account}-us-east-1"
s3_prefix = "skorify-api"
region = "us-east-1"
capabilities = "CAPABILITY_NAMED_IAM"
confirm_changeset = false
disable_rollback = false
image_repositories = []
parameter_overrides = 'Environment="${env}" VpcId="${c.vpcId}" PrivateSubnetIdsParameter="/skorify/${env}/private-subnet-ids" CognitoUserPoolDomain="${c.cognitoDomain}" GoogleClientId="${c.googleClientId}" CognitoCallbackURLs="${c.callbackUrls}" DomainName="${c.domainName}" CertificateArn="${c.certificateArn}" DbParameterArn="/skorify/${env}/db-secret-arn" BusParameterArn="/skorify/${env}/data-bus-name" OpsAlertsTopicArn="/skorify/${env}/ops-alerts-topic-arn" RouteAuthorization="${c.routeAuthorization}"'`;

    const samconfig = `version = 0.1

[default.build.parameters]
cached = true
parallel = true

${Object.entries(envConfigs)
  .map(([env, c]) => deploySection(env, c))
  .join('\n\n')}
`;

    await writeFile(join(fullDistFolder, `samconfig.toml`), samconfig, {
      mode: 0o777,
    });
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
          if (stdout) {
            logger.debug('Extra resource build output', {
              resource: folder,
              output: stdout.trim(),
            });
          }
          if (stderr) {
            logger.warn('Extra resource build stderr', {
              resource: folder,
              output: stderr.trim(),
            });
          }
          if (error) {
            reject(new Error(`Build failed for extra-resource "${folder}": ${error.message}`));
          } else {
            resolve();
          }
        });
      });
    }

    const jwtAuthorizerFolder = 'jwt-authorizer';
    const jwtAuthorizerSrc = join(extraResources, jwtAuthorizerFolder);
    const jwtAuthorizerDest = join(this.generatedFolder, jwtAuthorizerFolder);

    const existsJwtFolder = await existsFile(jwtAuthorizerDest);
    if (!existsJwtFolder) {
      await mkdir(jwtAuthorizerDest);
    }

    const jwtFiles = await readdir(jwtAuthorizerSrc);
    for (const file of jwtFiles) {
      const src = join(jwtAuthorizerSrc, file);
      const content = await readFile(src, 'utf-8');
      await writeFile(join(jwtAuthorizerDest, file), content, { mode: 0o777 });
    }

    await new Promise<void>((resolve, reject) => {
      exec(`cd ${jwtAuthorizerDest} && pnpm i && pnpm run build`, (error: Error | null, stdout: string, stderr: string) => {
        if (stdout) {
          logger.debug('Extra resource build output', { resource: jwtAuthorizerFolder, output: stdout.trim() });
        }
        if (stderr) {
          logger.warn('Extra resource build stderr', { resource: jwtAuthorizerFolder, output: stderr.trim() });
        }
        if (error) {
          reject(new Error(`Build failed for extra-resource "${jwtAuthorizerFolder}": ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    const jwtAuthorizerTemplate = `JwtAuthorizerLambda:
    Type: AWS::Serverless::Function
    Properties:
      Handler: jwt-authorizer/index.handler
      Timeout: 10
      Policies:
        - AWSLambdaBasicExecutionRole
        - AWSLambdaVPCAccessExecutionRole
      Environment:
        Variables:
          USER_POOL_ID: !Ref CognitoUserPool
          M2M_CLIENT_ID: !Ref CognitoM2MClient
          M2M_SCOPE: !Sub 'https://api.skorify-\${Environment}.cloud-manizales.com/internal'
          ROUTE_AUTHORIZATION: !Ref RouteAuthorization`;

    response.push(jwtAuthorizerTemplate);

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
    env: string,
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
      logger.debug('Copying module controller', {
        module: usecaseConfig.module,
        source: originalControllerPath,
      });

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

            generate(
                '${env}',
                container, {
                  dependencyName: "${type}",
                  module: "${mm}",
                  methodMapper
                },
                headers
              );
       
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
