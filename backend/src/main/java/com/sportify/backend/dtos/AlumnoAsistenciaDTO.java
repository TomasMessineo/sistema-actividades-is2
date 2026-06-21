package com.sportify.backend.dtos;

import com.sportify.backend.entities.Alumno;

/**
 * Alumno anotado en una clase puntual, junto con si faltó a esa clase
 * (null si todavía no se le pasó asistencia).
 */
public class AlumnoAsistenciaDTO {

    private Integer id;
    private String nombre;
    private String apellido;
    private String email;
    private String dni;
    private Boolean falto;

    public AlumnoAsistenciaDTO() {}

    public AlumnoAsistenciaDTO(Integer id, String nombre, String apellido, String email, String dni, Boolean falto) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.dni = dni;
        this.falto = falto;
    }

    public static AlumnoAsistenciaDTO fromEntity(Alumno alumno, Boolean falto) {
        return new AlumnoAsistenciaDTO(
                alumno.getId(),
                alumno.getNombre(),
                alumno.getApellido(),
                alumno.getEmail(),
                alumno.getDni(),
                falto
        );
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public Boolean getFalto() { return falto; }
    public void setFalto(Boolean falto) { this.falto = falto; }
}
