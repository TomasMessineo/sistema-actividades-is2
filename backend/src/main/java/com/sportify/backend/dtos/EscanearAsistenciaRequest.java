package com.sportify.backend.dtos;

/**
 * Id del alumno leído desde su código QR al pasar asistencia.
 */
public class EscanearAsistenciaRequest {

    private Integer idAlumno;

    public Integer getIdAlumno() { return idAlumno; }
    public void setIdAlumno(Integer idAlumno) { this.idAlumno = idAlumno; }
}
