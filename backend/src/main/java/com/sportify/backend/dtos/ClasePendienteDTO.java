package com.sportify.backend.dtos;

import java.time.LocalDate;

public class ClasePendienteDTO {

    private int idClase;
    private LocalDate fecha;
    private int hora;
    private String actividad;

    public ClasePendienteDTO() {}

    public ClasePendienteDTO(int idClase, LocalDate fecha, int hora, String actividad) {
        this.idClase = idClase;
        this.fecha = fecha;
        this.hora = hora;
        this.actividad = actividad;
    }

    public int getIdClase() { return idClase; }
    public void setIdClase(int idClase) { this.idClase = idClase; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public int getHora() { return hora; }
    public void setHora(int hora) { this.hora = hora; }

    public String getActividad() { return actividad; }
    public void setActividad(String actividad) { this.actividad = actividad; }
}
