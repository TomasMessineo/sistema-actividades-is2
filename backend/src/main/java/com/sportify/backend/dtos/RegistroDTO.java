package com.sportify.backend.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegistroDTO {
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String password;
    private LocalDate fechaNacimiento;
}