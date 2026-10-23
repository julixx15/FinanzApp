"""
Módulo de cálculos y reportes financieros — lógica de negocio pura.

Requisito académico (Guía N.° 6):
  - for   : recorrer la lista de movimientos en todos los reportes.
  - while : no aplica directamente en cálculos (se usa en validaciones
            interactivas de consola, aquí el equivalente es la
            validación de entrada vía Pydantic en la capa API).
  - break : buscar_primer_por_categoria detiene el recorrido al
            encontrar el primer resultado.
  - continue: reporte_gastos salta movimientos que no son gastos.
  - ciclos anidados: agrupar_por_categoria recorre categorías y dentro
    de cada una recorre los movimientos.
  - Condiciones: filtros de tipo, valor mínimo y clasificación de nivel.

Decisiones de diseño:
  - Todos los cálculos monetarios usan Decimal para evitar errores
    de punto flotante.
  - Los porcentajes se calculan solo cuando total_ingresos > 0 para
    evitar división por cero.
  - Los umbrales de clasificación están documentados como constantes.
  - Este módulo no importa FastAPI ni SQLAlchemy: es completamente
    testeable con pytest sin levantar ningún servidor.
"""

from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass, field

from app.schemas.movimiento import MovimientoResponse
from app.db.models import TipoMovimiento


# ------------------------------------------------------------------ #
# Umbrales de clasificación de importe (configurables)               #
# ------------------------------------------------------------------ #

#: Importe a partir del cual un movimiento se clasifica como ALTO.
UMBRAL_ALTO: Decimal = Decimal("500_000")

#: Importe a partir del cual un movimiento se clasifica como MEDIO.
#: Por debajo se clasifica como BAJO.
UMBRAL_MEDIO: Decimal = Decimal("100_000")


# ------------------------------------------------------------------ #
# Tipos de retorno                                                    #
# ------------------------------------------------------------------ #

@dataclass
class ResumenFinanciero:
    """
    Totales, saldo disponible y porcentajes financieros.

    porcentaje_gastos y porcentaje_ahorros son None cuando no hay
    ingresos para evitar división por cero.
    """
    total_ingresos: Decimal
    total_gastos: Decimal
    total_ahorros: Decimal
    saldo_disponible: Decimal
    porcentaje_gastos: Decimal | None   # gastos / ingresos * 100
    porcentaje_ahorros: Decimal | None  # ahorros / ingresos * 100


@dataclass
class MovimientoClasificado:
    """Movimiento enriquecido con su nivel de importe."""
    id: int
    tipo: str
    monto: Decimal
    categoria: str
    descripcion: str
    fecha: str
    nivel: str  # "ALTO" | "MEDIO" | "BAJO"


@dataclass
class ResultadoConsulta:
    """Resultado de consultar_por_tipo_y_valor."""
    movimientos: list[MovimientoClasificado]
    cantidad: int
    total: Decimal


@dataclass
class ResultadoBusqueda:
    """Resultado de buscar_primer_por_categoria."""
    encontrado: MovimientoResponse | None
    revisados: int  # cantidad de movimientos revisados antes de encontrar


@dataclass
class ReporteGastos:
    """Estadísticas del reporte de gastos."""
    cantidad: int
    total: Decimal
    promedio: Decimal
    mayor_gasto: MovimientoResponse | None


@dataclass
class SubtotalCategoria:
    """Subtotal de una categoría con sus movimientos."""
    categoria: str
    movimientos: list[MovimientoResponse]
    subtotal: Decimal
    cantidad: int


@dataclass
class ReporteCategorias:
    """Resultado del agrupamiento por categoría."""
    categorias: list[SubtotalCategoria]
    total_categorias: int = field(init=False)

    def __post_init__(self) -> None:
        self.total_categorias = len(self.categorias)


# ------------------------------------------------------------------ #
# Funciones de cálculo                                                #
# ------------------------------------------------------------------ #

def _dos_decimales(valor: Decimal) -> Decimal:
    """Redondea a 2 decimales con ROUND_HALF_UP."""
    return valor.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _clasificar_nivel(monto: Decimal) -> str:
    """
    Clasifica un importe según los umbrales definidos.

    ALTO  : monto >= UMBRAL_ALTO   (>= $500.000)
    MEDIO : monto >= UMBRAL_MEDIO  (>= $100.000)
    BAJO  : monto <  UMBRAL_MEDIO  (<  $100.000)
    """
    if monto >= UMBRAL_ALTO:
        return "ALTO"
    if monto >= UMBRAL_MEDIO:
        return "MEDIO"
    return "BAJO"


def calcular_resumen(movimientos: list[MovimientoResponse]) -> ResumenFinanciero:
    """
    Calcula el resumen financiero completo.

    Recorre la lista con for y acumula totales por tipo.
    Los porcentajes se calculan solo si hay ingresos (evita ÷ 0).

    Args:
        movimientos: lista completa de MovimientoResponse.

    Returns:
        ResumenFinanciero con totales, saldo y porcentajes.
    """
    total_ingresos = Decimal("0")
    total_gastos   = Decimal("0")
    total_ahorros  = Decimal("0")

    # for: recorrer todos los movimientos y clasificar por tipo
    for mov in movimientos:
        if mov.tipo == TipoMovimiento.ingreso:
            total_ingresos += mov.monto
        elif mov.tipo == TipoMovimiento.gasto:
            total_gastos += mov.monto
        else:
            total_ahorros += mov.monto

    saldo_disponible = total_ingresos - total_gastos - total_ahorros

    # Porcentajes: None si no hay ingresos para evitar división por cero
    if total_ingresos > Decimal("0"):
        porcentaje_gastos  = _dos_decimales(
            total_gastos / total_ingresos * Decimal("100")
        )
        porcentaje_ahorros = _dos_decimales(
            total_ahorros / total_ingresos * Decimal("100")
        )
    else:
        porcentaje_gastos  = None
        porcentaje_ahorros = None

    return ResumenFinanciero(
        total_ingresos=total_ingresos,
        total_gastos=total_gastos,
        total_ahorros=total_ahorros,
        saldo_disponible=saldo_disponible,
        porcentaje_gastos=porcentaje_gastos,
        porcentaje_ahorros=porcentaje_ahorros,
    )


def consultar_por_tipo_y_valor(
    movimientos: list[MovimientoResponse],
    tipo: TipoMovimiento,
    monto_minimo: Decimal = Decimal("0"),
) -> ResultadoConsulta:
    """
    Filtra movimientos por tipo y valor mínimo, clasificando cada uno.

    Usa for + condiciones (and) para aplicar ambos filtros simultáneamente,
    igual que en la Guía N.° 6 Actividad 5.

    Args:
        movimientos: lista completa de movimientos.
        tipo: tipo a filtrar (ingreso, gasto, ahorro).
        monto_minimo: importe mínimo inclusive (0 = ver todos).

    Returns:
        ResultadoConsulta con lista clasificada, cantidad y total.
    """
    encontrados: list[MovimientoClasificado] = []
    total = Decimal("0")

    # for + condiciones (and): ambos filtros deben cumplirse
    for mov in movimientos:
        if mov.tipo == tipo and mov.monto >= monto_minimo:
            nivel = _clasificar_nivel(mov.monto)
            encontrados.append(
                MovimientoClasificado(
                    id=mov.id,
                    tipo=mov.tipo.value,
                    monto=mov.monto,
                    categoria=mov.categoria,
                    descripcion=mov.descripcion,
                    fecha=str(mov.fecha),
                    nivel=nivel,
                )
            )
            total += mov.monto

    return ResultadoConsulta(
        movimientos=encontrados,
        cantidad=len(encontrados),
        total=total,
    )


def buscar_primer_por_categoria(
    movimientos: list[MovimientoResponse],
    categoria: str,
) -> ResultadoBusqueda:
    """
    Busca el primer movimiento de una categoría y detiene la búsqueda.

    Implementa break (Guía N.° 6, Actividad 8): una vez encontrado
    el primer resultado, continuar recorriendo no aporta información.

    Args:
        movimientos: lista completa de movimientos.
        categoria: nombre de categoría (búsqueda case-insensitive).

    Returns:
        ResultadoBusqueda con el movimiento encontrado y los revisados.
    """
    buscada = categoria.lower().strip()
    encontrado: MovimientoResponse | None = None
    revisados = 0

    # for + break: detenemos cuando encontramos el primer resultado
    for mov in movimientos:
        revisados += 1
        if mov.categoria.lower() == buscada:
            encontrado = mov
            break  # ya no es necesario continuar

    return ResultadoBusqueda(encontrado=encontrado, revisados=revisados)


def reporte_gastos(movimientos: list[MovimientoResponse]) -> ReporteGastos:
    """
    Genera estadísticas de gastos omitiendo ingresos y ahorros.

    Implementa continue (Guía N.° 6, Actividad 9): si el movimiento
    no es un gasto, se salta y se pasa al siguiente.

    Args:
        movimientos: lista completa de movimientos.

    Returns:
        ReporteGastos con cantidad, total, promedio y mayor gasto.
    """
    cantidad = 0
    total_gastos = Decimal("0")
    mayor: MovimientoResponse | None = None

    # for + continue: ignoramos lo que no es gasto
    for mov in movimientos:
        if mov.tipo != TipoMovimiento.gasto:
            continue  # saltar ingresos y ahorros

        cantidad += 1
        total_gastos += mov.monto

        # Actualizar mayor gasto
        if mayor is None or mov.monto > mayor.monto:
            mayor = mov

    promedio = (
        _dos_decimales(total_gastos / Decimal(cantidad))
        if cantidad > 0
        else Decimal("0")
    )

    return ReporteGastos(
        cantidad=cantidad,
        total=total_gastos,
        promedio=promedio,
        mayor_gasto=mayor,
    )


def agrupar_por_categoria(
    movimientos: list[MovimientoResponse],
) -> ReporteCategorias:
    """
    Agrupa movimientos por categoría y calcula subtotales.

    Implementa ciclos anidados (Guía N.° 6, Actividad 10):
    - Ciclo externo: recorre las categorías únicas.
    - Ciclo interno: recorre todos los movimientos buscando los de esa
      categoría (con continue para saltar los que no pertenecen).

    Args:
        movimientos: lista completa de movimientos.

    Returns:
        ReporteCategorias con subtotal por cada categoría encontrada.
    """
    # Obtener categorías únicas preservando el orden de aparición
    # (for para recorrer y construir el set ordenado)
    categorias_vistas: list[str] = []
    for mov in movimientos:
        if mov.categoria not in categorias_vistas:
            categorias_vistas.append(mov.categoria)

    subtotales: list[SubtotalCategoria] = []

    # Ciclo externo: por cada categoría única
    for categoria in categorias_vistas:
        movs_categoria: list[MovimientoResponse] = []
        subtotal = Decimal("0")

        # Ciclo interno: buscar movimientos de esta categoría
        for mov in movimientos:
            if mov.categoria.lower() != categoria.lower():
                continue  # no pertenece a esta categoría

            movs_categoria.append(mov)
            subtotal += mov.monto

        subtotales.append(
            SubtotalCategoria(
                categoria=categoria,
                movimientos=movs_categoria,
                subtotal=subtotal,
                cantidad=len(movs_categoria),
            )
        )

    return ReporteCategorias(categorias=subtotales)
