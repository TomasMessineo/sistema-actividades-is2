package com.sportify.backend.dtos;

import com.sportify.backend.entities.Alumno;

/**
 * Vista resumida de un alumno (sin password ni relaciones), usada por ejemplo
 * para el listado de alumnos de un profesor.
 */
public class AlumnoResumenDTO {

    private Integer id;
    private String nombre;
    private String apellido;
    private String email;
    private String dni;

    public AlumnoResumenDTO() {}

    public AlumnoResumenDTO(Integer id, String nombre, String apellido, String email, String dni) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.dni = dni;
    }

    public static AlumnoResumenDTO fromEntity(Alumno alumno) {
        return new AlumnoResumenDTO(
                alumno.getId(),
                alumno.getNombre(),
                alumno.getApellido(),
                alumno.getEmail(),
                alumno.getDni()
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
}
