package com.sportify.backend.dtos;

import lombok.Data;

@Data
public class RegistroProfesorDTO {
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private Integer actividadId;
}
