import { getMethodToUse, MassiveRegisterConfiguration } from '@scifamek-open-source/iraca/web-api';
import { generalMethodMapper } from '@skorify/domain/core';
import { exec } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
	repositoryTemplate: string;
};

export class ModuleLambdaAWSBuilder extends Builder {
	async build(config: BuilderConfiguration): Promise<void> {
		const allUsecases = await this.getUsecases(config.serverFolder);
		writeFileSync('vegeta.json', JSON.stringify(allUsecases, null, 2));
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
		const samTemplate = await readFile(join(templatesFolder, './sam.template.yaml'), 'utf-8');
		const helpersTemplate = await readFile(join(templatesFolder, './helpers.ts'), 'utf-8');
		const repositoryTemplate = await readFile(
			join(templatesFolder, './base.repository.ts'),
			'utf-8',
		);

		// const { fullDistFolder, fullGeneratedFolder } =
		//   await this.createAllModuleFolders(config, usecasesConfig);
		const {fullDistFolder, fullGeneratedFolder} = await this.makeTargetFolders(config);

		await this.createModuleFolders(allUsecases, fullGeneratedFolder, 'usecases');
		const promises = [];

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
			let replacedLambdaTemplate = sourceCodeTemplate;
			const injections: string[] = [];
			let imports: string[] = [];
			const fullImports: string[] = [];

			const moduleConfig = modulesConfig[module];
			const usecasesConfig = moduleConfig.usecases;
			const moduleFolder = join(fullGeneratedFolder, module);

			for (const usecaseConfig of usecasesConfig) {
				const usecaseProperties = await this.getPropertiesByUsecase(usecasesConfig, usecaseConfig);
				const {} = await this.constructUsecase(
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
						repositoryTemplate,
					},
					fullGeneratedFolder,
					fullDistFolder,
					injections,
					fullImports,
				);
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
			await writeFile(join(moduleFolder, `index.ts`), replacedLambdaTemplate);

			const n = new Promise<void>((resolve, reject) => {
				exec(`cd ${moduleFolder} && pnpm run build `, () => {
					resolve();
				});
			});
			await n;
		}

		// replacedLambdaTemplate = replacedLambdaTemplate.replace(
		//   toToken("MAIN_USECASE_DEPENDENCIES"),
		//   `[${dependencies.join(",")}]`,
		// );

		// return myYamlTemplate;
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
	): Promise<any> {
		const {
			packageTemplate,
			sourceCodeTemplate,
			tsconfigTemplate,
			helpersTemplate,
			samTemplate,
			repositoryTemplate,
		} = templates;
		let myYamlTemplate = samTemplate;

		const source = klass.sourceCode;

		const moduleFolder = join(fullGeneratedFolder, usecaseConfig.module);

		const existsUsecaseFolder = await existsFile(moduleFolder);
		if (!existsUsecaseFolder) {
			await mkdir(moduleFolder);
		}

		await writeFile(
			join(moduleFolder, 'usecases', `${usecaseConfig.kebadUsecaseName}.usecase-impl.ts`),
			source,
		);

		const controllerPath = join(moduleFolder, 'infrastructure', 'controller.ts');

		const existsControllerPath = await existsFile(controllerPath);
		if (existsControllerPath) {
			const controllerContent = await readFile(controllerPath, {
				encoding: 'utf-8',
			});
			await writeFile(join(moduleFolder, `controller.ts`), controllerContent);
		}

		await writeFile(
			join(moduleFolder, `package.json`),
			packageTemplate
				.replace(toToken('MODULE'), usecaseConfig.module)
				.replace(toToken('USECASE'), usecaseConfig.kebadUsecaseName),
		);

		await writeFile(join(moduleFolder, `tsconfig.json`), tsconfigTemplate);
		await writeFile(join(moduleFolder, `helpers.ts`), helpersTemplate);
		await writeFile(
			join(moduleFolder, `${usecaseConfig.module}.repository.ts`),
			repositoryTemplate.replace(toToken('ENTITY'), usecaseConfig.modulePascal),
		);

		const sourceFile = klass.compiledSourceCode;

		myYamlTemplate = samTemplate
			.replace(new RegExp(toToken('MAIN_USECASE'), 'g'), klass.parent?.replace('Usecase', '') ?? '')
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

		injections.push(`
            container.add({
              abstraction: ${klass.usecaseName},
              implementation: ${klass.usecaseName}Impl
            });
`);

		this.addImport(imports, allUsecases, klass.usecaseName, source);
		this.addImport(imports, allUsecases, `${klass.usecaseName}Impl`, source, 'usecases/');

		klass.attributes.forEach((param) => {
			const {kind, name, type, module} = param;
			dependencies.push(type);
			if (kind == 'usecase') {
				if (module != klass.module) {
					this.addImport(imports, allUsecases, type, source);
					injections.push(`
            container.add({
              abstraction: ${type},
              implementation: generate({
                dependencyName: "${type}",
                methodMapper
              }),
            });
`);
				} else {
					this.addImport(imports, allUsecases, type, source);
				}
			} else if (type.includes('Contract')) {
				this.addImport(imports, allUsecases, type, source);

				injections.push(`
      container.add({
        abstraction: ${type},
        implementation: ${usecaseConfig.modulePascal}Repository
      });
`);
			}
		});

		return {
			imports,
			moduleFolder,
		};
	}
}
