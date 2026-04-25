# Skorify Backend

## Arquitectura del Proyecto

Este proyecto implementa una **Arquitectura Hexagonal (Clean Architecture)** con separación clara de responsabilidades en tres capas principales:

### 📁 Estructura de Capas

```
Skorify_Backend/
├── domain/          # Capa de Dominio (Core Business Logic)
├── server/          # Capa de Aplicación + Infraestructura
└── builders/        # Builders para diferentes deployments
```

---

## 🎯 Capa de Dominio (`/domain`)

**Responsabilidad:** Contiene las reglas de negocio puras, independientes de frameworks y detalles técnicos.

### Qué va en el Dominio:

#### 1. **Entidades** (`*.entity.ts`)
- Objetos de negocio con identidad única
- Métodos que encapsulan lógica de negocio relacionada con la entidad
- **Ejemplo:** `MatchEntity.canBet()` - valida si se puede apostar en un partido

```typescript
// match.entity.ts
export class MatchEntity extends Entity {
  public canBet(): boolean {
    // Lógica de negocio: validar tiempo, estado, vigencia
    return true;
  }
}
```

#### 2. **Casos de Uso Abstractos** (`*.usecase.ts`)
- Definición de contratos para casos de uso
- Extienden de `Usecase<Param>` del core
- **NO contienen implementación**, solo la firma

```typescript
// make-bet.usecase.ts
export abstract class MakeBetUsecase extends Usecase<MakeBetParam> {}
```

#### 3. **Contratos/Interfaces** (`*.contract.ts`)
- Definen interfaces para repositorios y servicios externos
- Permiten la inversión de dependencias
- **Ejemplo:** `MatchContract` define métodos de persistencia

```typescript
// match.contract.ts
export abstract class MatchContract {
  abstract getById(id: string): Promise<MatchEntity | null>;
  abstract save(match: MatchEntity): Promise<MatchEntity | null>;
}
```

#### 4. **Domain Events** (`*.domain-event.ts`)
- Eventos que representan hechos del negocio
- Utilizan `DomainEventKind` para crear eventos tipados
- **Ejemplo:** `GottenMatchDomainEvent`, `MatchCannotBeBetedDomainEvent`

#### 5. **Value Objects y DTOs**
- Parámetros de entrada (`*.param.ts`)
- Objetos de valor sin identidad

### ❌ Qué NO va en el Dominio:
- Implementaciones de repositorios
- Detalles de frameworks (Express, DB drivers)
- Lógica de presentación
- Configuraciones de infraestructura

---

## 🔧 Capa de Aplicación (`/server/src/features`)

**Responsabilidad:** Orquesta el flujo de la aplicación, coordina casos de uso y maneja la lógica de aplicación.

### Qué va en la Aplicación:

#### 1. **Implementaciones de Casos de Uso** (`*.usecase-impl.ts`)
- Implementan los casos de uso abstractos del dominio
- Coordinan múltiples entidades y otros casos de uso
- Manejan el flujo de la aplicación

```typescript
// make-bet.usecase-impl.ts
export class MakeBetUsecaseImpl extends MakeBetUsecase {
  async call(param: MakeBetParam): Promise<DomainEvent> {
    // 1. Validar usuario existe
    const userDE = await this.getUserByIdUsecase.call({userId});
    
    // 2. Validar partido existe
    const matchDE = await this.getMatchByIdUsecase.call({matchId});
    
    // 3. Aplicar regla de negocio
    if (!match.canBet()) {
      return MatchCannotBeBetedDomainEvent();
    }
    
    // 4. Realizar apuesta
    return BasicDomainEvent();
  }
}
```

#### 2. **Composición de Dependencias**
- Inyección de dependencias
- Ensamblaje de casos de uso con sus dependencias
- Configuración de servicios

### ❌ Qué NO va en la Aplicación:
- Lógica de negocio pura (eso va en entidades)
- Detalles de implementación de persistencia
- Definiciones de contratos abstractos

---

## 🔌 Capa de Infraestructura (`/server/src/features/*/infrastructure`)

**Responsabilidad:** Implementa los detalles técnicos y la comunicación con el mundo exterior.

### Qué va en la Infraestructura:

#### 1. **Repositorios** (`*.repository.ts`)
- Implementan los contratos del dominio
- Manejan persistencia de datos (DB, in-memory, APIs)

```typescript
// match-in-memory.repository.ts
export class MatchInMemoryRepository extends MatchContract {
  async getById(id: string): Promise<MatchEntity | null> {
    return this.matches.find((m) => m.id == id) || null;
  }
  
  async save(match: MatchEntity): Promise<MatchEntity | null> {
    this.matches.push(match);
    return match;
  }
}
```

#### 2. **Adaptadores Externos**
- Clientes HTTP
- Servicios de terceros
- Sistema de archivos
- Colas de mensajes

#### 3. **Configuraciones Técnicas**
- Conexiones a base de datos
- Variables de entorno
- Configuración de frameworks

### ❌ Qué NO va en la Infraestructura:
- Lógica de negocio
- Validaciones de reglas del negocio
- Orquestación de casos de uso

---

## 🔄 Flujo de Dependencias

```
Infraestructura → Aplicación → Dominio
```

- El **Dominio** no depende de nada
- La **Aplicación** depende del Dominio
- La **Infraestructura** implementa contratos del Dominio

---

## 🚀 Comandos de Instalación

### Para correr el server

```shell
cd server
pnpm i
pnpm run start:dev
```

### Para el dominio

```shell
cd domain
pnpm i
pnpm run build
```

### Para los builder

```shell
cd builder
pnpm i
pnpm run sla

```
Luego para ejecutar lo que compiló, debemos ir a la carpeta dist, y allí encontraremos el archivo "template.yaml". Con ese archivo podemos levantar SAM usando el siguiente comando

**Deben tener instaldo SAM**

```shell
sam local start-api
```
