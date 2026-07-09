package com.sportify.backend.dtos;

/**
 * Cuerpo opcional al cancelar una clase puntual. El motivo es obligatorio si la
 * clase tiene alumnos inscriptos: se les comunica por mail junto con la baja.
 */
public class CancelarClaseRequest {

    private String motivo;

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}