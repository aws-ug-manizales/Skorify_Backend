# Fixtures y Datos de Prueba

Este directorio contiene las fixtures (datos de prueba) que se usan para generar archivos JSON para desarrollo local.

## 🎯 Objetivo

Los archivos JSON de datos de prueba NO se versionan en git para evitar conflictos cuando diferentes desarrolladores prueban el sistema. En su lugar, cada desarrollador genera sus propios archivos localmente usando el script de seed.

## 📁 Estructura

```
fixtures/
├── README.md              # Este archivo
├── seed.js                # Script principal de generación
├── teams.fixture.js       # Datos de equipos
├── tournaments.fixture.js # Datos de torneos
└── matches.fixture.js     # Datos de partidos
```

## 🚀 Uso

### Generar datos por primera vez

```bash
# Desde la raíz del proyecto
cd shared
pnpm run seed
```

### Regenerar datos (limpiar y crear nuevos)

```bash
cd shared
pnpm run seed:clean
```

### Después de clonar el repositorio

```bash
# 1. Instalar dependencias
pnpm install

# 2. Generar datos de prueba
cd shared && pnpm run seed

# 3. Compilar shared
pnpm run build

# 4. Iniciar servidor
cd ../server && pnpm run dev
```

## 📝 Archivos Generados

El script genera los siguientes archivos en `shared/src/data/`:

- ✅ `teams.json` - 6 equipos CONMEBOL
- ✅ `tournaments.json` - 3 torneos (Mundial, Copa América, Eliminatorias)
- ✅ `matches.json` - 2 partidos de ejemplo
- ✅ `users.json` - Vacío (se llena al usar la app)
- ✅ `predictions.json` - Vacío (se llena al usar la app)
- ✅ `tournament-instances.json` - Vacío (se llena al usar la app)
- ✅ `user-enrollments.json` - Vacío (se llena al usar la app) 

## 🔧 Agregar Nuevos Datos

Para agregar más datos de prueba:

1. **Edita el archivo fixture correspondiente**:
   ```javascript
   // teams.fixture.js
   const teamsFixture = [
     // ... equipos existentes
     {
       id: "team-ecuador",
       name: "Ecuador",
       createdAt: "2026-01-04T00:00:00.000Z",
     },
   ];

   module.exports = { teamsFixture };
   ```

2. **Regenera los archivos**:
   ```bash
   pnpm run seed:clean
   ```

3. **Los cambios se aplicarán automáticamente** a `shared/src/data/teams.json`

## ⚠️ Importante

- ❌ **NO** subir archivos `shared/src/data/*.json` a git
- ✅ **SÍ** versionar archivos `shared/src/fixtures/*.js`
- 🔄 Ejecutar `pnpm run seed` después de hacer `git pull` si hay cambios en fixtures
- 📦 Los datos generados son solo para desarrollo, no para producción

## 🛠️ Solución de Problemas

### Error: "ENOENT: no such file or directory"

```bash
# El directorio data/ no existe, se creará automáticamente
pnpm run seed
```

### Los datos no se cargan en el servidor

```bash
# 1. Verificar que los archivos existen
ls shared/src/data/

# 2. Recompilar shared
cd shared && pnpm run build

# 3. Reiniciar servidor
cd ../server && pnpm run dev
```
