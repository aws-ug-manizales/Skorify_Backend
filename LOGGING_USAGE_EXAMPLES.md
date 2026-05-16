# Ejemplos Prácticos: Aplicar Logging a Use Cases y Repositories

## 1. Decorar Use Cases

### Patrón General

```typescript
import { LogUsecase } from "@skorify/shared";

export class MyUsecaseImpl extends MyUsecase {
  constructor(private dependency: SomeDependency) {
    super();
  }

  @LogUsecase()
  async call(param: MyParam): Promise<DomainEvent> {
    // Tu lógica aquí - Logging automático de:
    // ✓ Entrada (param)
    // ✓ Salida (DomainEvent)
    // ✓ Duración
    // ✓ CorrelationId
    // ✓ Errores y stack traces
  }
}
```

### Ejemplos ya implementados

- ✅ `GetMatchByIdUsecaseImpl` (server/src/features/match/usecases/)

### Para decorar

Agrega `@LogUsecase()` a los siguientes archivos:

```bash
server/src/features/match/usecases/create-match.usecase-impl.ts
server/src/features/prediction/usecases/make-prediction.usecase-impl.ts
server/src/features/user/usecases/get-user-by-id.usecase-impl.ts
server/src/features/team/usecases/get-team-by-id.usecase-impl.ts
server/src/features/tournament/usecases/get-tournament-by-id.usecase-impl.ts
server/src/features/tournament-instance/usecases/get-tournament-instance-by-id.usecase-impl.ts
```

## 2. Decorar Repositories

### Patrón General

```typescript
import { BaseRepository, LogRepository } from "@skorify/shared";

export class MyRepositoryLogged extends BaseRepository<MyEntity> {
  constructor(ds: DataSource<MyEntity>) {
    super(ds);
  }

  @LogRepository()
  async getById(id: string): Promise<MyEntity | null> {
    return super.getById(id);
  }

  @LogRepository()
  async save(entity: MyEntity): Promise<MyEntity | null> {
    return super.save(entity);
  }

  @LogRepository()
  async deleteById(id: string): Promise<MyEntity | null> {
    return super.deleteById(id);
  }

  @LogRepository()
  async modifyById(id: string, entity: MyEntity): Promise<MyEntity | null> {
    return super.modifyById(id, entity);
  }

  @LogRepository()
  async getAll(): Promise<MyEntity[]> {
    return super.getAll();
  }

  @LogRepository()
  async getByIDs(ids: string[]): Promise<MyEntity[]> {
    return super.getByIDs(ids);
  }

  @LogRepository()
  async filter(filters: Partial<MyEntity>): Promise<MyEntity[]> {
    return super.filter(filters);
  }
}
```

### Ejemplo completo: UserRepositoryLogged

```typescript
// shared/src/repositories/user.repository.logged.ts
import { UserEntity } from "@skorify/domain/user";
import { BaseRepository, DataSource, LogRepository } from "../core";

export class UserRepositoryLogged extends BaseRepository<UserEntity> {
  constructor(ds: DataSource<UserEntity>) {
    super(ds);
  }

  @LogRepository()
  async getById(id: string): Promise<UserEntity | null> {
    return super.getById(id);
  }

  @LogRepository()
  async save(entity: UserEntity): Promise<UserEntity | null> {
    return super.save(entity);
  }

  @LogRepository()
  async deleteById(id: string): Promise<UserEntity | null> {
    return super.deleteById(id);
  }

  @LogRepository()
  async modifyById(id: string, entity: UserEntity): Promise<UserEntity | null> {
    return super.modifyById(id, entity);
  }

  @LogRepository()
  async getAll(): Promise<UserEntity[]> {
    return super.getAll();
  }

  @LogRepository()
  async getByIDs(ids: string[]): Promise<UserEntity[]> {
    return super.getByIDs(ids);
  }

  @LogRepository()
  async filter(filters: Partial<UserEntity>): Promise<UserEntity[]> {
    return super.filter(filters);
  }
}
```

### Activar en extra-dependencies.ts

```typescript
// server/src/extra-dependencies.ts
import { UserRepositoryLogged } from "@skorify/shared";

export const extraDependencies: RunIracaConfig["extraDependencies"] = [
  {
    abstraction: UserContract,
    implementation: UserRepositoryLogged,  // ← Cambiar de UserRepository
    dependencies: ["UserDatasource"],
  },
  // ... resto de dependencias
];
```

## 3. Plantillas para Copiar-Pegar

### Use Case sin Dependencias

```typescript
import { LogUsecase } from "@skorify/shared";
import { GetMyThingParam, GetMyThingUsecase } from "@skorify/domain/mything";
import { DomainEvent } from "@skorify/domain/core";

export class GetMyThingUsecaseImpl extends GetMyThingUsecase {
  @LogUsecase()
  async call(param: GetMyThingParam): Promise<DomainEvent> {
    // Tu implementación
    return MyThingFoundDomainEvent();
  }
}
```

### Use Case con Dependencia en Constructor

```typescript
import { LogUsecase } from "@skorify/shared";
import { GetMyThingParam, GetMyThingUsecase, MyThingContract } from "@skorify/domain/mything";
import { DomainEvent } from "@skorify/domain/core";

export class GetMyThingUsecaseImpl extends GetMyThingUsecase {
  constructor(private contract: MyThingContract) {
    super();
  }

  @LogUsecase()
  async call(param: GetMyThingParam): Promise<DomainEvent> {
    const thing = await this.contract.getById(param.thingId);
    if (!thing) {
      return MyThingNotFoundDomainEvent();
    }
    return MyThingFoundDomainEvent(thing);
  }
}
```

### Repository Extendido

```typescript
import { MyEntity } from "@skorify/domain/mything";
import { BaseRepository, DataSource, LogRepository } from "../core";

export class MyRepositoryLogged extends BaseRepository<MyEntity> {
  constructor(ds: DataSource<MyEntity>) {
    super(ds);
  }

  @LogRepository()
  async getById(id: string): Promise<MyEntity | null> {
    return super.getById(id);
  }

  @LogRepository()
  async save(entity: MyEntity): Promise<MyEntity | null> {
    return super.save(entity);
  }

  @LogRepository()
  async deleteById(id: string): Promise<MyEntity | null> {
    return super.deleteById(id);
  }

  @LogRepository()
  async getAll(): Promise<MyEntity[]> {
    return super.getAll();
  }

  @LogRepository()
  async filter(filters: Partial<MyEntity>): Promise<MyEntity[]> {
    return super.filter(filters);
  }
}
```

## 4. Checklist para Aplicación Completa

- [ ] Decorar todos los use cases en `server/src/features/*/usecases/*.usecase-impl.ts`
- [ ] Crear versiones `*RepositoryLogged` para cada repository
- [ ] Actualizar `server/src/extra-dependencies.ts` para inyectar las versiones con logging
- [ ] Compilar con `pnpm build` desde cada paquete
- [ ] Pruebas locales: `cd server && pnpm run start:dev`
- [ ] Verificar logs en `logs/application.log` y `logs/errors.log`
- [ ] Revisar correlationId propagándose en el flujo

## 5. Verificación

### Compilación

```bash
cd domain && pnpm build && cd ..
cd shared && pnpm build && cd ..
cd server && pnpm build && cd ..
```

### Ejecución y Prueba

```bash
cd server
pnpm run start:dev

# En otra terminal, prueba un endpoint:
curl http://localhost:9898/api/matches/match-123

# Revisa los logs:
tail -f logs/application.log
```

### Output Esperado

```json
{
  "timestamp": "2026-05-14T15:35:22.111Z",
  "level": "INFO",
  "message": "[a7f3c9d2-5678-1234-5678-9abc12345678] Starting use case: GetMatchByIdUsecaseImpl.call",
  "context": {
    "correlationId": "a7f3c9d2-5678-1234-5678-9abc12345678",
    "operation": "GetMatchByIdUsecaseImpl.call",
    "input": { "matchId": "match-123" }
  }
}

{
  "timestamp": "2026-05-14T15:35:22.115Z",
  "level": "DEBUG",
  "message": "[a7f3c9d2-5678-1234-5678-9abc12345678] Repository operation: MatchRepositoryLogged.getById",
  "context": {
    "correlationId": "a7f3c9d2-5678-1234-5678-9abc12345678",
    "operation": "MatchRepositoryLogged.getById",
    "args": ["match-123"]
  }
}

{
  "timestamp": "2026-05-14T15:35:22.118Z",
  "level": "DEBUG",
  "message": "[a7f3c9d2-5678-1234-5678-9abc12345678] Repository operation completed: MatchRepositoryLogged.getById",
  "context": {
    "correlationId": "a7f3c9d2-5678-1234-5678-9abc12345678",
    "operation": "MatchRepositoryLogged.getById",
    "resultType": "MatchEntity",
    "duration": 3
  }
}

{
  "timestamp": "2026-05-14T15:35:22.120Z",
  "level": "INFO",
  "message": "[a7f3c9d2-5678-1234-5678-9abc12345678] Use case completed: GetMatchByIdUsecaseImpl.call",
  "context": {
    "correlationId": "a7f3c9d2-5678-1234-5678-9abc12345678",
    "operation": "GetMatchByIdUsecaseImpl.call",
    "output": {
      "eventName": "GottenMatchDomainEvent",
      "payload": { "id": "match-123", "status": "active", ... }
    },
    "duration": 9
  }
}
```

## 6. Notas Importantes

1. **No modificar el dominio**: Los decoradores viven en shared, no en domain
2. **LoggerAdapter en server**: La librería específica (`@scifamek-open-source/logger`) solo en server
3. **CorrelationId automático**: Cada decorador genera uno si no existe
4. **Compartir correlationId**: Todos los logs de un request llevan el mismo ID
5. **Performance**: Los decoradores agregan mínimo overhead (microsegundos)
6. **Errores automáticos**: Stack traces capturados sin código adicional

## 7. Migración Gradual

No necesitas decorar todo de una vez. Puedes hacerlo gradualmente:

**Fase 1** (actual): Decorar ejemplos clave
- ✅ GetMatchByIdUsecaseImpl
- ✅ MatchRepository

**Fase 2**: Decorar casos de uso críticos
- MakePredictionUsecase
- CreateMatchUsecase

**Fase 3**: Cobertura completa
- Todos los use cases
- Todos los repositories

**Fase 4** (opcional): Monitoreo centralizado
- Enviar logs a CloudWatch, ELK, etc.
- Alertas basadas en patrones de error
