package com.sportify.backend.dtos;

import java.time.LocalDate;

public class ClaseEnEsperaDTO {

    private int idClase;
    private LocalDate fecha;
    private int hora;
    private String actividad;
    private int posicion;
    private boolean tieneAcceso;

    public ClaseEnEsperaDTO() {}

    public ClaseEnEsperaDTO(int idClase, LocalDate fecha, int hora, String actividad, int posicion, boolean tieneAcceso) {
        this.idClase = idClase;
        this.fecha = fecha;
        this.hora = hora;
        this.actividad = actividad;
        this.posicion = posicion;
        this.tieneAcceso = tieneAcceso;
    }

    public int getIdClase() { return idClase; }
    public void setIdClase(int idClase) { this.idClase = idClase; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public int getHora() { return hora; }
    public void setHora(int hora) { this.hora = hora; }

    public String getActividad() { return actividad; }
    public void setActividad(String actividad) { this.actividad = actividad; }

    public int getPosicion() { return posicion; }
    public void setPosicion(int posicion) { this.posicion = posicion; }

    public boolean isTieneAcceso() { return tieneAcceso; }
    public void setTieneAcceso(boolean tieneAcceso) { this.tieneAcceso = tieneAcceso; }
}
