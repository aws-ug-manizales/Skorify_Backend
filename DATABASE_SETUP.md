# Database Setup - PostgreSQL Connection

Guía para configurar y conectar el backend a PostgreSQL.

## Requisitos

- Node.js 24.14.1 (LTS)
- pnpm 10.22.0+
- Docker o Podman
- PostgreSQL 16+ (se ejecuta en contenedor)

## Configuración Local

### 1. Configurar base de datos PostgreSQL

La aplicación usa la librería [Skorify_Data](https://github.com/aws-ug-manizales/Skorify_Data) para gestionar las migraciones y el esquema de BD.

```bash
# Clonar repositorio de datos (fuera del proyecto backend)
git clone https://github.com/aws-ug-manizales/Skorify_Data.git

# Navegar a la carpeta
cd Skorify_Data

# Copiar .env.example a .env
cp .env.example .env

# Editar .env con las credenciales deseadas
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=polla_mundial
# DB_USER=postgres
# DB_PASSWORD=password

# Levantar PostgreSQL con Docker/Podman
pnpm run db:up

# Ejecutar migraciones (crea 14 tablas)
pnpm run migrate

# Cargar datos de prueba (opcional)
pnpm run seed
```

Ver [Skorify_Data README](https://github.com/aws-ug-manizales/Skorify_Data/blob/main/ReadmeDatos.md) para más detalles.

### 2. Configurar backend

```bash
# En la carpeta server/
cd server
cp .env.example .env
```

Editar `server/.env` con **las mismas credenciales** que usaste en Skorify_Data:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=polla_mundial
DB_USER=postgres
DB_PASSWORD=password
NODE_ENV=development
SKO_PREDICTION_EDITING_WINDOW=10
```

### 3. Instalar dependencias

```bash
# Desde la raíz del proyecto
pnpm install
```

La dependencia `skorifydata` se instalará automáticamente desde GitHub (v1.1.0-beta).

### 4. Iniciar servidor

```bash
cd server
pnpm run start:dev
```

Deberías ver en los logs:
```
Database connected successfully
Porting: 9898
```

## Verificar conexión

### Opción 1: Endpoint HTTP

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:9898/match/get-match-by-id?matchId=<uuid>" -Method GET

# O usar curl
curl "http://localhost:9898/match/get-match-by-id?matchId=<uuid>"
```

### Opción 2: Consulta directa a PostgreSQL

```bash
podman exec -it skorify_db psql -U postgres -d polla_mundial -c "SELECT COUNT(*) FROM matches;"
```

## Arquitectura de persistencia

El proyecto usa el patrón Repository con abstracción DataSource:

```
┌─────────────┐
│  Use Case   │
└──────┬──────┘
       │
┌──────▼──────┐
│ Repository  │ (MatchRepository, UserRepository, etc.)
└──────┬──────┘
       │
┌──────▼──────────────┐
│    DataSource       │
├─────────────────────┤
│ • JsonDataSource    │ ← Persistencia en archivos (temporal)
│ • PostgresDataSource│ ← Persistencia en PostgreSQL (producción)
└─────────────────────┘
```

### Estado actual

| Entidad | DataSource | Estado |
|---------|------------|--------|
| Match | PostgresDataSource | ✅ Conectado a PostgreSQL |
| User | JsonDataSource | 📝 Pendiente migración |
| Prediction | JsonDataSource | 📝 Pendiente migración |
| Tournament | JsonDataSource | 📝 Pendiente migración |

## Librerías utilizadas

- **skorifydata** (v1.1.0-beta): Entidades TypeORM, migraciones Knex, DBClient
  - Instalada desde: `github:aws-ug-manizales/Skorify_Data#v1.1.0-beta`
- **typeorm**: ORM para operaciones de BD
- **pg**: Driver de PostgreSQL
- **dotenv**: Variables de entorno

## Troubleshooting

### Error: Cannot find module 'skorifydata'

```bash
# Reinstalar dependencias
cd server && pnpm install
cd ../shared && pnpm install
```

### Error: Connection refused

1. Verificar que PostgreSQL esté corriendo:
   ```bash
   podman ps
   ```

2. Si no está corriendo, levantarlo:
   ```bash
   cd Skorify_Data
   podman compose up -d
   ```

### Error: Database does not exist

```bash
cd Skorify_Data
pnpm run migrate
```

### Error: Invalid credentials

Verifica que las credenciales en `server/.env` coincidan con las de `Skorify_Data/.env`.

## Comandos útiles

```bash
# Ver logs de PostgreSQL
podman logs skorify_db

# Conectarse a PostgreSQL
podman exec -it skorify_db psql -U postgres -d polla_mundial

# Ver tablas
podman exec -it skorify_db psql -U postgres -d polla_mundial -c "\dt"

# Detener PostgreSQL
cd Skorify_Data && podman compose down

# Resetear BD (⚠️ elimina todos los datos)
cd Skorify_Data
podman compose down -v
pnpm run setup
```
