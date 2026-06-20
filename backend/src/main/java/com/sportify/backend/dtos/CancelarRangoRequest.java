package com.sportify.backend.dtos;

import java.time.LocalDate;

/**
 * Rango de fechas a cancelar dentro de una serie (plantilla). Las instancias
 * faltantes en el rango se materializan antes de cancelarlas.
 */
public class CancelarRangoRequest {

    private LocalDate desde;
    private LocalDate hasta;

    public LocalDate getDesde() { return desde; }
    public void setDesde(LocalDate desde) { this.desde = desde; }

    public LocalDate getHasta() { return hasta; }
    public void setHasta(LocalDate hasta) { this.hasta = hasta; }
}
