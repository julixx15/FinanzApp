# ADR-004: Pydantic para validación de entrada

**Estado:** Aceptado  
**Fecha:** 2026-10-23

## Contexto

FastAPI integra Pydantic de forma nativa. Necesitamos validar que los datos entrantes sean correctos antes de llegar a la lógica de negocio o a la base de datos.

## Decisión

Definir schemas Pydantic en `app/schemas/` para toda entrada y salida de la API. Separar `Create`, `Update` y `Response` por recurso.

## Consecuencias

**Positivas:**
- Validación automática con mensajes de error claros
- Documentación OpenAPI generada automáticamente
- Tipado estricto en la frontera de entrada del sistema

**Negativas:**
- Los schemas pueden duplicar parcialmente los modelos SQLAlchemy (mitigado con `from_attributes = True`)
