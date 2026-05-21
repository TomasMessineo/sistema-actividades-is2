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
            Alumno nuevoAlumno = Alumno.builder()
                    .nombre(registroDTO.getNombre())
                    .apellido(registroDTO.getApellido())
                    .dni(registroDTO.getDni())
                    .email(registroDTO.getEmail())
                    .password(registroDTO.getPassword())
                    .fechaNacimiento(registroDTO.getFechaNacimiento())
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