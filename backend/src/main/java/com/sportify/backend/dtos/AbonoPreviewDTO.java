package com.sportify.backend.dtos;

import java.time.LocalDate;

public class AbonoPreviewDTO {

    public enum Motivo {
        LLENA,
        CONFLICTO_HORARIO,
        CANCELADA,
        YA_INSCRIPTO
    }

    private int idClase;
    private LocalDate fecha;
    private int hora;
    private String actividad;
    private boolean disponible;
    private Motivo motivo;

    public AbonoPreviewDTO() {}

    public AbonoPreviewDTO(int idClase, LocalDate fecha, int hora, String actividad, boolean disponible, Motivo motivo) {
        this.idClase = idClase;
        this.fecha = fecha;
        this.hora = hora;
        this.actividad = actividad;
        this.disponible = disponible;
        this.motivo = motivo;
    }

    public int getIdClase() { return idClase; }
    public void setIdClase(int idClase) { this.idClase = idClase; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public int getHora() { return hora; }
    public void setHora(int hora) { this.hora = hora; }

    public String getActividad() { return actividad; }
    public void setActividad(String actividad) { this.actividad = actividad; }

    public boolean isDisponible() { return disponible; }
    public void setDisponible(boolean disponible) { this.disponible = disponible; }

    public Motivo getMotivo() { return motivo; }
    public void setMotivo(Motivo motivo) { this.motivo = motivo; }
}
