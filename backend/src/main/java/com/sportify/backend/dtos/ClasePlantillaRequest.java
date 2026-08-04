package com.sportify.backend.dtos;

/**
 * Datos para crear una serie de clases (plantilla perpetua). El backend genera
 * las instancias semanales a partir del día y hora indicados.
 */
public class ClasePlantillaRequest {

    // Día de la semana en inglés y minúsculas: "monday".."friday".
    private String dia;
    private Integer hora;
    private Integer cupo;
    private Integer actividadId;
    private Integer profesorId;
    private Double precio;

    public String getDia() { return dia; }
    public void setDia(String dia) { this.dia = dia; }

    public Integer getHora() { return hora; }
    public void setHora(Integer hora) { this.hora = hora; }

    public Integer getCupo() { return cupo; }
    public void setCupo(Integer cupo) { this.cupo = cupo; }

    public Integer getActividadId() { return actividadId; }
    public void setActividadId(Integer actividadId) { this.actividadId = actividadId; }

    public Integer getProfesorId() { return profesorId; }
    public void setProfesorId(Integer profesorId) { this.profesorId = profesorId; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
}
