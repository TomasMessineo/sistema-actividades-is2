package com.sportify.backend.dtos;

/**
 * Cambio de profesor de una clase. El alcance define si afecta solo a la
 * instancia ("INDIVIDUAL") o a toda la serie de aquí en adelante ("SERIE").
 */
public class CambiarProfesorRequest {

    private Integer profesorId;
    private String alcance; // "INDIVIDUAL" | "SERIE"

    public Integer getProfesorId() { return profesorId; }
    public void setProfesorId(Integer profesorId) { this.profesorId = profesorId; }

    public String getAlcance() { return alcance; }
    public void setAlcance(String alcance) { this.alcance = alcance; }
}
