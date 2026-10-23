# ADR-002: Separación entre core y api en el backend

**Estado:** Aceptado  
**Fecha:** 2026-10-23

## Contexto

En proyectos FastAPI pequeños es común poner toda la lógica dentro de las rutas. Esto crea archivos difíciles de testear y mantener.

## Decisión

Separar el backend en dos capas independientes:
- `app/api/` — solo maneja HTTP: recibe, valida con Pydantic, delega, responde
- `app/core/` — lógica de negocio pura en Python sin importar FastAPI

## Consecuencias

**Positivas:**
- `core/` es testeable con pytest sin levantar el servidor HTTP
- Cumple principio de responsabilidad única (SOLID)
- Facilita reutilizar lógica en scripts o tareas programadas

**Negativas:**
- Agrega un nivel de indirección que puede parecer excesivo en features simples
- Requiere disciplina para no saltarse la capa en cambios rápidos
