import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as ts from 'typescript';
import { stringify } from 'yaml';

const ROOT = join(__dirname, '..', '..', '..');
const TEMPLATE_PATH = join(ROOT, 'builders', 'dist', 'template.yaml');
const OUTPUT_PATH = join(ROOT, 'openapi.yaml');
const FEATURES = join(ROOT, 'server', 'src', 'features');

const DOMAIN_DIST =
  [
    join(ROOT, 'builders', 'node_modules', '@skorify', 'domain', 'dist'),
    join(ROOT, 'server', 'node_modules', '@skorify', 'domain', 'dist'),
    join(ROOT, 'node_modules', '@skorify', 'domain', 'dist'),
  ].find(existsSync) ?? '';

const BODY_METHODS = new Set(['put', 'post', 'patch']);

const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
const toCamelCase = (k: string) => k.split('-').map((p, i) => (i ? capitalize(p) : p)).join('');
const toPascalCase = (k: string) => k.split('-').map(capitalize).join('');
const toTitleCase = (k: string) => k.split('-').map(capitalize).join(' ');
const toSentence = (k: string) => capitalize(k.split('-').join(' '));

function walkFiles(dir: string, filter: (f: string) => boolean): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkFiles(full, filter));
    else if (filter(full)) out.push(full);
  }
  return out;
}

function parseFile(file: string): ts.SourceFile {
  return ts.createSourceFile(file, readFileSync(file, 'utf-8'), ts.ScriptTarget.Latest, true);
}

interface Member { name: string; type: ts.TypeNode; optional: boolean; }
const interfaces = new Map<string, Member[]>();
const classes = new Map<string, { members: Member[]; base?: string }>();
const aliases = new Map<string, ts.TypeNode>();
const domainEvents = new Map<string, ts.TypeNode | null>();

function memberFrom(m: ts.PropertySignature | ts.PropertyDeclaration): Member | null {
  if (!m.type || !m.name) return null;
  const name = m.name.getText();
  if (name.startsWith('_')) return null;
  if (m.modifiers?.some((x) => x.kind === ts.SyntaxKind.PrivateKeyword)) return null;
  return { name, type: m.type, optional: !!m.questionToken };
}

function payloadTypeOf(typeNode: ts.TypeNode | undefined): ts.TypeNode | null | undefined {
  if (!typeNode) return undefined;
  let name = '';
  let args: ts.NodeArray<ts.TypeNode> | undefined;
  if (ts.isImportTypeNode(typeNode)) {
    name = typeNode.qualifier?.getText() ?? '';
    args = typeNode.typeArguments;
  } else if (ts.isTypeReferenceNode(typeNode)) {
    name = typeNode.typeName.getText();
    args = typeNode.typeArguments;
  } else {
    return undefined;
  }
  if (name.endsWith('DomainEventKindWithPayload') || name === 'DomainEventKindWithPayload') {
    return args?.[0] ?? null;
  }
  if (name.endsWith('DomainEventKind') || name === 'DomainEventKind') return null;
  return undefined;
}

function indexDomain(): void {
  if (!DOMAIN_DIST) return;
  for (const file of walkFiles(DOMAIN_DIST, (f) => f.endsWith('.d.ts'))) {
    parseFile(file).forEachChild((node) => {
      if (ts.isInterfaceDeclaration(node)) {
        interfaces.set(node.name.text, node.members.map((m) =>
          ts.isPropertySignature(m) ? memberFrom(m) : null).filter(Boolean) as Member[]);
      } else if (ts.isClassDeclaration(node) && node.name) {
        const members = node.members
          .map((m) => (ts.isPropertyDeclaration(m) ? memberFrom(m) : null))
          .filter(Boolean) as Member[];
        const base = node.heritageClauses
          ?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)
          ?.types[0]?.expression.getText();
        classes.set(node.name.text, { members, base });
      } else if (ts.isTypeAliasDeclaration(node)) {
        aliases.set(node.name.text, node.type);
      } else if (ts.isVariableStatement(node)) {
        for (const d of node.declarationList.declarations) {
          const evName = d.name.getText();
          if (!/DomainEvent$/.test(evName)) continue;
          const payload = payloadTypeOf(d.type);
          if (payload !== undefined) domainEvents.set(evName, payload);
        }
      }
    });
  }
}

function typeToSchema(type: ts.TypeNode, depth = 0): any {
  if (depth > 8) return {};
  switch (type.kind) {
    case ts.SyntaxKind.StringKeyword: return { type: 'string' };
    case ts.SyntaxKind.NumberKeyword: return { type: 'number' };
    case ts.SyntaxKind.BooleanKeyword: return { type: 'boolean' };
    case ts.SyntaxKind.AnyKeyword:
    case ts.SyntaxKind.UnknownKeyword:
    case ts.SyntaxKind.ObjectKeyword: return {};
  }
  if (ts.isParenthesizedTypeNode(type)) return typeToSchema(type.type, depth + 1);
  if (ts.isTemplateLiteralTypeNode(type)) return { type: 'string' };
  if (ts.isLiteralTypeNode(type)) {
    if (ts.isStringLiteral(type.literal)) return { type: 'string' };
    if (ts.isNumericLiteral(type.literal)) return { type: 'number' };
    return {};
  }
  if (ts.isArrayTypeNode(type)) return { type: 'array', items: typeToSchema(type.elementType, depth + 1) };
  if (ts.isTypeReferenceNode(type)) {
    const name = type.typeName.getText();
    if (name === 'Date') return { type: 'string', format: 'date-time' };
    if ((name === 'Array' || name === 'Promise') && type.typeArguments?.[0]) {
      const inner = typeToSchema(type.typeArguments[0], depth + 1);
      return name === 'Array' ? { type: 'array', items: inner } : inner;
    }
    if (aliases.has(name)) return typeToSchema(aliases.get(name)!, depth + 1);
    if (interfaces.has(name)) return objectSchema(interfaces.get(name)!, depth + 1);
    if (classes.has(name)) return classSchema(name, depth + 1);
    return { type: 'string' };
  }
  if (ts.isUnionTypeNode(type)) {
    const real = type.types.filter(
      (t) => t.kind !== ts.SyntaxKind.UndefinedKeyword && t.kind !== ts.SyntaxKind.NullKeyword,
    );
    const lits = real.filter(ts.isLiteralTypeNode);
    if (lits.length && lits.length === real.length && lits.every((l) => ts.isStringLiteral(l.literal))) {
      return { type: 'string', enum: lits.map((l) => l.literal.getText().replace(/['"]/g, '')) };
    }
    return typeToSchema(real[0] ?? type.types[0], depth + 1);
  }
  if (ts.isTypeLiteralNode(type)) {
    const members = type.members
      .map((m) => (ts.isPropertySignature(m) ? memberFrom(m) : null))
      .filter(Boolean) as Member[];
    return objectSchema(members, depth + 1);
  }
  return {};
}

function objectSchema(members: Member[], depth = 0): any {
  const properties: Record<string, any> = {};
  const required: string[] = [];
  for (const m of members) {
    properties[m.name] = typeToSchema(m.type, depth + 1);
    if (!m.optional) required.push(m.name);
  }
  return { type: 'object', properties, ...(required.length ? { required } : {}) };
}

function classSchema(name: string, depth = 0): any {
  if (depth > 8) return { type: 'object' };
  const cls = classes.get(name);
  if (!cls) return { type: 'object' };
  return objectSchema(classSchemaMembers(name, depth), depth);
}

function classSchemaMembers(name: string, depth = 0): Member[] {
  if (depth > 8) return [];
  const cls = classes.get(name);
  if (!cls) return [];
  const base = cls.base && classes.has(cls.base) ? classSchemaMembers(cls.base, depth + 1) : [];
  return [...base, ...cls.members];
}

function eventDataSchema(eventName: string): any {
  const payload = domainEvents.get(eventName);
  return payload ? typeToSchema(payload) : {};
}

interface Propagation {
  usecase: string;
  exclude: string[];
  includeOnly: string[];
}
interface UsecaseInfo {
  directEvents: Set<string>;
  propagations: Propagation[];
  entityBuild: boolean;
}
const usecaseIndex = new Map<string, UsecaseInfo>();

function guardForReturn(rs: ts.ReturnStatement, ident: string): { exclude: string[]; includeOnly: string[] } {
  let p: ts.Node | undefined = rs.parent;
  while (p && !ts.isIfStatement(p)) p = p.parent;
  const exclude: string[] = [];
  const includeOnly: string[] = [];
  if (!p || !ts.isIfStatement(p)) return { exclude, includeOnly };
  const scan = (n: ts.Node) => {
    if (
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      n.expression.expression.getText() === ident &&
      n.arguments[0] &&
      ts.isIdentifier(n.arguments[0])
    ) {
      const fn = n.expression.name.text;
      if (fn === 'isNot') exclude.push(n.arguments[0].text);
      else if (fn === 'is') includeOnly.push(n.arguments[0].text);
    }
    n.forEachChild(scan);
  };
  scan(p.expression);
  return { exclude, includeOnly };
}

const unwrap = (e: ts.Expression): ts.Expression =>
  ts.isAwaitExpression(e) || ts.isParenthesizedExpression(e) ? unwrap(e.expression) : e;

function calledUsecaseProp(e: ts.Expression): string | null {
  if (!ts.isCallExpression(e) || !ts.isPropertyAccessExpression(e.expression)) return null;
  if (e.expression.name.text !== 'call') return null;
  const obj = e.expression.expression;
  if (ts.isPropertyAccessExpression(obj) && obj.expression.kind === ts.SyntaxKind.ThisKeyword) {
    return obj.name.text;
  }
  return null;
}

const isEntityBuild = (e: ts.Expression): boolean =>
  ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && e.expression.name.text === 'build';

const isPromiseAll = (e: ts.Expression): boolean =>
  ts.isCallExpression(e) &&
  ts.isPropertyAccessExpression(e.expression) &&
  e.expression.name.text === 'all' &&
  e.expression.expression.getText() === 'Promise';

function analyzeImpl(cls: ts.ClassDeclaration): UsecaseInfo {
  const deps = new Map<string, string>();
  const ctor = cls.members.find(ts.isConstructorDeclaration);
  ctor?.parameters.forEach((p) => {
    if (p.modifiers?.length && p.type && ts.isIdentifier(p.name)) deps.set(p.name.text, p.type.getText());
  });

  const origin = new Map<string, { usecase?: string; build?: boolean }>();
  const info: UsecaseInfo = { directEvents: new Set(), propagations: [], entityBuild: false };

  const visit = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && n.initializer) {
      const init = unwrap(n.initializer);
      if (ts.isIdentifier(n.name)) {
        const prop = calledUsecaseProp(init);
        if (prop && deps.has(prop)) origin.set(n.name.text, { usecase: deps.get(prop) });
        else if (isEntityBuild(init)) origin.set(n.name.text, { build: true });
      } else if (ts.isArrayBindingPattern(n.name) && isPromiseAll(init)) {
        const arr = (init as ts.CallExpression).arguments[0];
        if (arr && ts.isArrayLiteralExpression(arr)) {
          n.name.elements.forEach((el, i) => {
            if (ts.isBindingElement(el) && ts.isIdentifier(el.name)) {
              const callExpr = arr.elements[i] && unwrap(arr.elements[i] as ts.Expression);
              const prop = callExpr && calledUsecaseProp(callExpr);
              if (prop && deps.has(prop)) origin.set(el.name.text, { usecase: deps.get(prop) });
            }
          });
        }
      }
    }
    if (ts.isReturnStatement(n) && n.expression) {
      const expr = unwrap(n.expression);
      if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression) && /DomainEvent$/.test(expr.expression.text)) {
        info.directEvents.add(expr.expression.text);
      } else if (ts.isIdentifier(expr)) {
        const o = origin.get(expr.text);
        if (o?.usecase) info.propagations.push({ usecase: o.usecase, ...guardForReturn(n, expr.text) });
        else if (o?.build) info.entityBuild = true;
      }
    }
    n.forEachChild(visit);
  };
  visit(cls);
  return info;
}

function indexImpls(): void {
  for (const file of walkFiles(FEATURES, (f) => f.endsWith('.usecase-impl.ts'))) {
    parseFile(file).forEachChild((node) => {
      if (ts.isClassDeclaration(node) && node.name && /UsecaseImpl$/.test(node.name.text)) {
        usecaseIndex.set(node.name.text.replace(/Impl$/, ''), analyzeImpl(node));
      }
    });
  }
}

function resolveEvents(usecaseName: string, seen = new Set<string>()): Set<string> {
  if (seen.has(usecaseName)) return new Set();
  seen.add(usecaseName);
  const info = usecaseIndex.get(usecaseName);
  if (!info) return new Set();
  const events = new Set(info.directEvents);
  if (info.entityBuild) events.add('EntityNotInstanciableDomainEvent');
  for (const prop of info.propagations) {
    if (prop.includeOnly.length) {
      prop.includeOnly.forEach((e) => events.add(e));
    } else {
      resolveEvents(prop.usecase, new Set(seen)).forEach((e) => {
        if (!prop.exclude.includes(e)) events.add(e);
      });
    }
  }
  return events;
}

interface Route { usecaseName: string; module: string; path: string; method: string; }

function parseRoutes(text: string): Route[] {
  const re = /(\w+):\s*\n\s*Type:\s*Api\s*\n\s*Properties:\s*\n\s*Path:\s*(\S+)\s*\n\s*Method:\s*(\S+)/g;
  const routes: Route[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    routes.push({ usecaseName: m[1], module: m[2].split('/').filter(Boolean)[0], path: m[2], method: m[3].toLowerCase() });
  }
  routes.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  return routes;
}

function buildOperation(route: Route): any {
  const usecase = route.path.split('/').filter(Boolean).pop()!;
  const baseName = route.usecaseName.replace(/Usecase$/, '');
  const op: any = { tags: [toTitleCase(route.module)], summary: toSentence(usecase), operationId: toCamelCase(usecase) };

  const paramName = `${baseName}Param`;
  const paramSchema = interfaces.has(paramName) ? objectSchema(interfaces.get(paramName)!) : null;
  if (paramSchema?.properties && Object.keys(paramSchema.properties).length) {
    if (BODY_METHODS.has(route.method)) {
      op.requestBody = { required: true, content: { 'application/json': { schema: paramSchema } } };
    } else {
      op.parameters = Object.entries(paramSchema.properties).map(([name, schema]) => ({
        name, in: 'query', required: (paramSchema.required ?? []).includes(name), schema,
      }));
    }
  }

  const pascal = toPascalCase(route.module);
  const events = [...resolveEvents(route.usecaseName)].sort();
  const branches = events.map((ev) => ({
    title: ev,
    type: 'object',
    properties: {
      meta: { type: 'object', properties: { code: { type: 'string', enum: [`${pascal}:${ev}`] } }, required: ['code'] },
      data: eventDataSchema(ev),
    },
    required: ['meta'],
  }));
  const schema = branches.length
    ? { oneOf: branches }
    : { type: 'object', properties: { meta: { type: 'object' }, data: {} } };

  op.responses = {
    '200': {
      description: 'Domain Event. El tipo va en meta.code y el payload en data.',
      content: { 'application/json': { schema } },
    },
    '500': { description: 'Error no controlado' },
  };
  return op;
}

function readVersion(): string {
  try {
    return JSON.parse(readFileSync(join(ROOT, 'server', 'package.json'), 'utf-8')).version ?? '1.0.0';
  } catch {
    return '1.0.0';
  }
}

function buildOpenApi(routes: Route[]): string {
  const modules = [...new Set(routes.map((r) => r.module))].sort();
  const paths: Record<string, any> = {};
  for (const route of routes) (paths[route.path] ??= {})[route.method] = buildOperation(route);

  const doc = {
    openapi: '3.2.0',
    info: {
      title: 'Skorify Backend API',
      description:
        `API RESTful del backend de Skorify. Documento generado automaticamente desde el codigo ` +
        `(${routes.length} endpoints). Todas las respuestas son Domain Events: el handler responde ` +
        `HTTP 200 con { data, meta.code }, donde meta.code identifica el evento (exito o error de negocio).`,
      version: readVersion(),
    },
    servers: [
      { url: 'https://api.skorify.cloud-manizales.com', description: 'Entorno PROD' },
      { url: 'https://api.skorify-dev.cloud-manizales.com', description: 'Entorno DEV' },
      { url: 'http://localhost:9898', description: 'Servidor local' },
    ],
    tags: modules.map((module) => ({
      name: toTitleCase(module),
      description: `Endpoints de ${toTitleCase(module)} (${routes.filter((r) => r.module === module).length})`,
    })),
    security: [{ CognitoAuthorizer: [] }],
    paths,
    components: {
      securitySchemes: {
        CognitoAuthorizer: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT emitido por el User Pool de Cognito (header Authorization).',
        },
      },
    },
  };

  return '# Archivo generado. Regenerar: cd builders && pnpm run openapi\n' + stringify(doc, { lineWidth: 0 });
}

function main(): void {
  const checkMode = process.argv.includes('--check');

  let templateText: string;
  try {
    templateText = readFileSync(TEMPLATE_PATH, 'utf-8');
  } catch {
    console.error(`[openapi] No se encontro ${TEMPLATE_PATH}.\nGenera el template SAM: cd builders && pnpm run mla`);
    process.exit(1);
  }
  if (!DOMAIN_DIST) {
    console.error('[openapi] No se encontro @skorify/domain/dist. Instala dependencias (pnpm install).');
    process.exit(1);
  }

  indexDomain();
  indexImpls();

  const routes = parseRoutes(templateText);
  if (routes.length === 0) {
    console.error('[openapi] El template no contiene rutas (Path/Method). Revisa el build.');
    process.exit(1);
  }

  const generated = buildOpenApi(routes);

  if (checkMode) {
    let current = '';
    try { current = readFileSync(OUTPUT_PATH, 'utf-8'); } catch { current = ''; }
    if (current !== generated) {
      console.error('[openapi] openapi.yaml desincronizado. Regenera: cd builders && pnpm run openapi (y commitea).');
      process.exit(1);
    }
    console.log(`[openapi] OK — ${routes.length} endpoints sincronizados.`);
    return;
  }

  writeFileSync(OUTPUT_PATH, generated);
  console.log(`[openapi] Generado openapi.yaml con ${routes.length} endpoints.`);
}

main();
