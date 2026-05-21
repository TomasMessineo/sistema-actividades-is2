package com.sportify.backend.controllers;

import com.sportify.backend.entities.Alumno;
import com.sportify.backend.services.AlumnoService;
import com.sportify.backend.dtos.RegistroDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    @Autowired
    private AlumnoService alumnoService;

    @PostMapping("/register")
    public ResponseEntity<?> registrarCliente(@RequestBody RegistroDTO registroDTO) {

        try {
            LocalDate fechaNacimiento = registroDTO.getFechaNacimiento();
            LocalDate hace16Anios = LocalDate.now().minusYears(16);
            
            // Por seguridad, vuelvo a evaluar la edad en el backend, aunque ya se hizo en el frontend, 
            // para evitar que alguien intente saltarse esa validación.
            if (fechaNacimiento != null && fechaNacimiento.isAfter(hace16Anios)) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("la cuenta no ha podido crearse debido a que el usuario debe tener mas de 16 años");
            }

            Alumno nuevoAlumno = Alumno.builder()
                    .nombre(registroDTO.getNombre())
                    .apellido(registroDTO.getApellido())
                    .dni(registroDTO.getDni())
                    .email(registroDTO.getEmail())
                    .password(registroDTO.getPassword())
                    .fechaNacimiento(fechaNacimiento)
                    .build();
            
            Alumno alumnoRegistrado = alumnoService.guardar(nuevoAlumno);
            return new ResponseEntity<>(alumnoRegistrado, HttpStatus.CREATED);  

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
        }
    }
}