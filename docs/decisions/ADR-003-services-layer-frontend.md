# ADR-003: Services layer en el frontend

**Estado:** Aceptado  
**Fecha:** 2026-10-23

## Contexto

Sin una capa de servicios, las llamadas fetch quedan dispersas dentro de componentes o hooks, dificultando el mantenimiento y las pruebas.

## Decisión

Centralizar todas las llamadas HTTP en `src/services/`. Cada archivo de servicio corresponde a un recurso de la API.

## Consecuencias

**Positivas:**
- Si la URL base o el formato de la API cambia, solo se toca el servicio
- Los hooks y componentes no conocen detalles de HTTP
- Fácil de mockear en pruebas con Vitest

**Negativas:**
- Un archivo extra por recurso; en proyectos muy pequeños puede parecer overhead
