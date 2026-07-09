package com.sportify.backend.dtos;

import java.time.LocalDate;

/**
 * Cambio de profesor de una clase. El alcance define si afecta solo a la
 * instancia ("INDIVIDUAL"), a las clases de la serie dentro de un rango de
 * fechas ("RANGO", usa desde/hasta) o a toda la serie de aquí en adelante
 * ("SERIE").
 */
public class CambiarProfesorRequest {

    private Integer profesorId;
    private String alcance; // "INDIVIDUAL" | "RANGO" | "SERIE"

    // Solo para alcance RANGO.
    private LocalDate desde;
    private LocalDate hasta;

    public Integer getProfesorId() { return profesorId; }
    public void setProfesorId(Integer profesorId) { this.profesorId = profesorId; }

    public String getAlcance() { return alcance; }
    public void setAlcance(String alcance) { this.alcance = alcance; }

    public LocalDate getDesde() { return desde; }
    public void setDesde(LocalDate desde) { this.desde = desde; }

    public LocalDate getHasta() { return hasta; }
    public void setHasta(LocalDate hasta) { this.hasta = hasta; }
}
