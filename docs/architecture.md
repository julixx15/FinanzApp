# Arquitectura de FinanzApp

## Visión general

FinanzApp sigue una arquitectura de **capas desacopladas** con separación estricta entre:

1. **Presentación** — React + TypeScript (frontend)
2. **API** — FastAPI (controladores HTTP)
3. **Lógica de negocio** — módulos Python puros, sin dependencia de HTTP ni DB
4. **Acceso a datos** — SQLAlchemy + SQLite
5. **Validación** — Pydantic schemas

```
┌─────────────────────────────────────┐
│           FRONTEND (React)          │
│  pages → components → hooks         │
│  services (fetch a API REST)         │
└──────────────┬──────────────────────┘
               │ HTTP / JSON
┌──────────────▼──────────────────────┐
│         BACKEND (FastAPI)           │
│                                     │
│  api/routes  ←→  schemas (Pydantic) │
│       ↓                             │
│  core/services  (lógica de negocio) │
│       ↓                             │
│  db/repositories  (SQLAlchemy)      │
│       ↓                             │
│       SQLite                        │
└─────────────────────────────────────┘
```

## Capas del backend

### `app/api/`
- Rutas FastAPI organizadas por recurso (`movimientos`, `categorias`, `reportes`)
- Solo orquesta: recibe request, llama al servicio, devuelve response
- Sin lógica de negocio

### `app/core/`
- Lógica pura de negocio: cálculo de saldo, filtros, generación de reportes
- Sin dependencia de FastAPI ni SQLAlchemy
- Completamente testeable con pytest sin levantar servidor

### `app/db/`
- Modelos SQLAlchemy (`models.py`)
- Sesión de base de datos (`database.py`)
- Repositorios: acceso a datos encapsulado (`repositories/`)

### `app/schemas/`
- Schemas Pydantic para validación de entrada/salida
- Separados por recurso: `MovimientoCreate`, `MovimientoResponse`, etc.

## Capas del frontend

### `src/pages/`
- Vistas completas: Dashboard, Movimientos, Reportes
- Solo composición de componentes y uso de hooks

### `src/components/`
- Componentes reutilizables y sin estado de negocio
- Ejemplos: `TransactionCard`, `FilterBar`, `Chart`, `Button`

### `src/hooks/`
- Custom hooks para encapsular lógica de estado y llamadas a API
- Ejemplos: `useMovimientos`, `useSaldo`, `useReporte`

### `src/services/`
- Funciones de fetch a la API REST
- Un archivo por recurso: `movimientosService.ts`, `reportesService.ts`

### `src/types/`
- Tipos TypeScript que reflejan los schemas del backend
- Fuente única de verdad para los tipos de dominio

## Modelo de dominio

### Movimiento
```
id: int
tipo: "ingreso" | "gasto" | "ahorro"
monto: float  (> 0)
categoria: str
descripcion: str (opcional)
fecha: date
```

### Resumen financiero
```
total_ingresos: float
total_gastos: float
total_ahorros: float
saldo_disponible: float  (ingresos - gastos - ahorros)
```

## Decisiones de diseño clave

Ver `docs/decisions/` para los ADRs completos.

| ID | Decisión |
|---|---|
| ADR-001 | SQLite como persistencia local |
| ADR-002 | Separación core/api en backend |
| ADR-003 | Services layer en frontend |
| ADR-004 | Pydantic para validación de entrada |

## Checklist de aceptación por fase

### Fase 1 — Arquitectura ✅
- [x] Estructura de carpetas definida
- [x] README.md con instrucciones
- [x] architecture.md documentado
- [x] ADRs iniciales creados
- [x] Convenciones de código establecidas

### Fase 2 — Backend base ⬜
- [ ] Modelo `Movimiento` en SQLAlchemy
- [ ] Schema `MovimientoCreate` y `MovimientoResponse` en Pydantic
- [ ] CRUD completo en repositorio
- [ ] Endpoints GET / POST / DELETE funcionando
- [ ] Pruebas pytest con cobertura > 80%
- [ ] Ruff sin errores

### Fase 3 — Frontend base ⬜
- [ ] Layout principal con navegación
- [ ] Página Dashboard con saldo
- [ ] Formulario para agregar movimiento
- [ ] Lista de movimientos con filtros
- [ ] Conexión real a la API del backend
- [ ] ESLint sin errores

### Fase 4 — Lógica y reportes ⬜
- [ ] Filtros por tipo, categoría y fecha
- [ ] Cálculo de saldo en tiempo real
- [ ] Gráfico de distribución (Recharts)
- [ ] Reporte mensual
- [ ] Búsqueda por categoría

### Fase 5 — Calidad y cierre ⬜
- [ ] Cobertura de pruebas frontend (Vitest)
- [ ] Pruebas de integración backend
- [ ] Sin código muerto ni TODOs pendientes
- [ ] README actualizado con capturas
- [ ] Tag de versión `v1.0.0`
