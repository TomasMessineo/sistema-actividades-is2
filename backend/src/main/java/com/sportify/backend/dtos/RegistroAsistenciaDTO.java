package com.sportify.backend.dtos;

import com.sportify.backend.entities.RegistroAsistencia;

import java.time.LocalDate;

/**
 * Una fila del historial de asistencias de un alumno: la clase a la que
 * estaba anotado y si faltó o no.
 */
public class RegistroAsistenciaDTO {

    private Integer idClase;
    private String actividad;
    private LocalDate fecha;
    private Integer hora;
    private boolean falto;

    public RegistroAsistenciaDTO() {}

    public RegistroAsistenciaDTO(Integer idClase, String actividad, LocalDate fecha, Integer hora, boolean falto) {
        this.idClase = idClase;
        this.actividad = actividad;
        this.fecha = fecha;
        this.hora = hora;
        this.falto = falto;
    }

    public static RegistroAsistenciaDTO fromEntity(RegistroAsistencia registro) {
        String actividadNombre = registro.getClase() != null
                && registro.getClase().getActividad() != null
                && registro.getClase().getActividad().getTipo() != null
                ? registro.getClase().getActividad().getTipo().name()
                : "CLASE";

        return new RegistroAsistenciaDTO(
                registro.getClase() != null ? registro.getClase().getIdClase() : null,
                actividadNombre,
                registro.getClase() != null ? registro.getClase().getFecha() : null,
                registro.getClase() != null ? registro.getClase().getHora() : null,
                Boolean.TRUE.equals(registro.getFalto())
        );
    }

    public Integer getIdClase() { return idClase; }
    public void setIdClase(Integer idClase) { this.idClase = idClase; }

    public String getActividad() { return actividad; }
    public void setActividad(String actividad) { this.actividad = actividad; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public Integer getHora() { return hora; }
    public void setHora(Integer hora) { this.hora = hora; }

    public boolean isFalto() { return falto; }
    public void setFalto(boolean falto) { this.falto = falto; }
}
