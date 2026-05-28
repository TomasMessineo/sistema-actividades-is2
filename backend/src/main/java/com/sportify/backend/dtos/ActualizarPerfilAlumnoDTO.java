package com.sportify.backend.dtos;

import lombok.Data;

@Data
public class ActualizarPerfilAlumnoDTO {
    private String nombre;
    private String apellido;
    private String email;
    private String currentPassword;
    private String password;
}