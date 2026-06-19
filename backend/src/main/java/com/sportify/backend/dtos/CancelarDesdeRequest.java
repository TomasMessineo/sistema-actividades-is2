package com.sportify.backend.dtos;

import java.time.LocalDate;

/**
 * Fecha a partir de la cual una serie (plantilla) deja de tener vigencia.
 */
public class CancelarDesdeRequest {

    private LocalDate desde;

    public LocalDate getDesde() { return desde; }
    public void setDesde(LocalDate desde) { this.desde = desde; }
}
