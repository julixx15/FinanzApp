# ADR-001: SQLite como persistencia local

**Estado:** Aceptado  
**Fecha:** 2026-10-23

## Contexto

El proyecto debe funcionar completamente de forma local, sin dependencias de servicios externos ni bases de datos remotas. Es un proyecto académico con volumen de datos bajo.

## Decisión

Usar **SQLite** como base de datos, accedida a través de **SQLAlchemy** como ORM.

## Consecuencias

**Positivas:**
- Cero configuración de servidor de base de datos
- Archivo único `.db` fácil de versionar o resetear
- SQLAlchemy permite migrar a PostgreSQL en el futuro sin cambiar el código de negocio

**Negativas:**
- No apto para concurrencia alta (no es un requisito del proyecto)
- No tiene servidor de administración visual por defecto (se puede usar DB Browser for SQLite)
