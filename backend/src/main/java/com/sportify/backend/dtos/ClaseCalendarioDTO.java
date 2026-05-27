package com.sportify.backend.dtos;

import com.sportify.backend.entities.Clase;

import java.time.LocalDate;

public class ClaseCalendarioDTO {
    private int idClase;
    private LocalDate fecha;
    private Integer hora;
    private String actividad;
    private int inscritos;
    private int cupo;
    private double precio;
    private boolean cancelada;

    public ClaseCalendarioDTO() {
    }

    public ClaseCalendarioDTO(int idClase, LocalDate fecha, Integer hora, String actividad, int inscritos, int cupo, double precio, boolean cancelada) {
        this.idClase = idClase;
        this.fecha = fecha;
        this.hora = hora;
        this.actividad = actividad;
        this.inscritos = inscritos;
        this.cupo = cupo;
        this.precio = precio;
        this.cancelada = cancelada;
    }

    public static ClaseCalendarioDTO fromEntity(Clase clase) {
        String actividadNombre = clase.getActividad() != null && clase.getActividad().getTipo() != null
                ? clase.getActividad().getTipo().name()
                : "CLASE";

        return new ClaseCalendarioDTO(
                clase.getIdClase(),
                clase.getFecha(),
                clase.getHora(),
                actividadNombre,
            clase.getListaAsistencia() != null && clase.getListaAsistencia().getAlumnos() != null
                ? clase.getListaAsistencia().getAlumnos().size()
                : 0,
                clase.getCupo(),
                clase.getPrecio(),
                clase.isCancelada()
        );
    }

    public int getIdClase() {
        return idClase;
    }

    public void setIdClase(int idClase) {
        this.idClase = idClase;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public Integer getHora() {
        return hora;
    }

    public void setHora(Integer hora) {
        this.hora = hora;
    }

    public String getActividad() {
        return actividad;
    }

    public void setActividad(String actividad) {
        this.actividad = actividad;
    }

    public int getInscritos() {
        return inscritos;
    }

    public void setInscritos(int inscritos) {
        this.inscritos = inscritos;
    }

    public int getCupo() {
        return cupo;
    }

    public void setCupo(int cupo) {
        this.cupo = cupo;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public boolean isCancelada() {
        return cancelada;
    }

    public void setCancelada(boolean cancelada) {
        this.cancelada = cancelada;
    }
}
