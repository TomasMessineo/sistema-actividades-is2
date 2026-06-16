package com.sportify.backend.dtos;

import java.time.LocalDate;
import java.util.List;

public class CrearClasesLoteRequest {

    private Integer actividadId;
    private Integer profesorId;
    private Integer hora;
    private Integer cupo;
    private List<LocalDate> fechas;

    public CrearClasesLoteRequest() {}

    public Integer getActividadId() { return actividadId; }
    public void setActividadId(Integer actividadId) { this.actividadId = actividadId; }

    public Integer getProfesorId() { return profesorId; }
    public void setProfesorId(Integer profesorId) { this.profesorId = profesorId; }

    public Integer getHora() { return hora; }
    public void setHora(Integer hora) { this.hora = hora; }

    public Integer getCupo() { return cupo; }
    public void setCupo(Integer cupo) { this.cupo = cupo; }

    public List<LocalDate> getFechas() { return fechas; }
    public void setFechas(List<LocalDate> fechas) { this.fechas = fechas; }
}
