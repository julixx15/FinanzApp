# FinanzApp

Aplicación web de gestión de finanzas personales desarrollada como proyecto académico para la asignatura **Diseño Funcional**, Guía de Aprendizaje N.° 6 — Unidad 2: Estructuras de Datos.

## Funcionalidades principales

- Registrar ingresos, gastos y ahorros
- Consultar historial de movimientos
- Calcular saldo disponible
- Filtrar movimientos por categoría, tipo y fecha
- Buscar por categoría
- Generar reportes financieros con gráficos

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite |
| Estilos | Tailwind CSS |
| Gráficos | Recharts |
| Backend | Python + FastAPI |
| Validación | Pydantic |
| Base de datos | SQLite + SQLAlchemy |
| Pruebas backend | pytest |
| Pruebas frontend | Vitest + React Testing Library |
| Linting Python | Ruff |
| Linting TS | ESLint |
| Versionamiento | Git + GitHub |

## Estructura del proyecto

```
FinanzApp/
├── backend/
│   ├── app/
│   │   ├── api/          # Rutas y controladores FastAPI
│   │   ├── core/         # Lógica de negocio pura
│   │   ├── db/           # Modelos SQLAlchemy y sesión
│   │   ├── schemas/      # Schemas Pydantic
│   │   └── main.py       # Punto de entrada FastAPI
│   ├── tests/            # Pruebas pytest
│   ├── requirements.txt
│   └── ruff.toml
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Vistas principales
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # Llamadas a la API
│   │   ├── types/        # Tipos TypeScript
│   │   └── utils/        # Utilidades puras
│   ├── tests/            # Pruebas Vitest
│   └── ...config files
└── docs/
    ├── architecture.md
    └── decisions/        # ADRs (Architecture Decision Records)
```

## Fases de desarrollo

| Fase | Descripción | Estado |
|---|---|---|
| 1 | Arquitectura, estructura y documentación | ✅ En curso |
| 2 | Backend: modelos, schemas, CRUD base | ⬜ Pendiente |
| 3 | Frontend: layout, componentes base, conexión API | ⬜ Pendiente |
| 4 | Lógica de negocio: filtros, cálculos, reportes | ⬜ Pendiente |
| 5 | Pruebas, calidad y ajustes finales | ⬜ Pendiente |

## Cómo ejecutar localmente

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

La API quedará disponible en `http://localhost:8000`  
El frontend en `http://localhost:5173`

## Convenciones

- Commits en español, imperativo: `Agrega modelo de movimiento`
- Ramas por fase: `fase-2-backend`, `fase-3-frontend`
- Un archivo = una responsabilidad
- Sin lógica de negocio en componentes visuales
- Tipado estricto en TypeScript y Python
