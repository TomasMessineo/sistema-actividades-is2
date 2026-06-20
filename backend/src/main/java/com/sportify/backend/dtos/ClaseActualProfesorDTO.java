package com.sportify.backend.dtos;

import com.sportify.backend.entities.Clase;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Clase que un profesor está dando en este momento (fecha y hora actuales),
 * con el listado de alumnos anotados para poder pasar asistencia.
 */
public class ClaseActualProfesorDTO {

    private Integer idClase;
    private String actividad;
    private Integer hora;
    private List<AlumnoResumenDTO> alumnos;

    public ClaseActualProfesorDTO() {}

    public ClaseActualProfesorDTO(Integer idClase, String actividad, Integer hora, List<AlumnoResumenDTO> alumnos) {
        this.idClase = idClase;
        this.actividad = actividad;
        this.hora = hora;
        this.alumnos = alumnos;
    }

    public static ClaseActualProfesorDTO fromEntity(Clase clase) {
        String actividadNombre = clase.getActividad() != null && clase.getActividad().getTipo() != null
                ? clase.getActividad().getTipo().name()
                : "CLASE";

        List<AlumnoResumenDTO> alumnos = clase.getListaAsistencia() != null && clase.getListaAsistencia().getAlumnos() != null
                ? clase.getListaAsistencia().getAlumnos().stream()
                        .map(AlumnoResumenDTO::fromEntity)
                        .collect(Collectors.toList())
                : List.of();

        return new ClaseActualProfesorDTO(clase.getIdClase(), actividadNombre, clase.getHora(), alumnos);
    }

    public Integer getIdClase() { return idClase; }
    public void setIdClase(Integer idClase) { this.idClase = idClase; }

    public String getActividad() { return actividad; }
    public void setActividad(String actividad) { this.actividad = actividad; }

    public Integer getHora() { return hora; }
    public void setHora(Integer hora) { this.hora = hora; }

    public List<AlumnoResumenDTO> getAlumnos() { return alumnos; }
    public void setAlumnos(List<AlumnoResumenDTO> alumnos) { this.alumnos = alumnos; }
}
