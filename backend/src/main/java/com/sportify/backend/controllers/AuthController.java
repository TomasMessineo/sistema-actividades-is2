package com.sportify.backend.controllers;

import com.sportify.backend.dtos.LoginDTO;
import com.sportify.backend.dtos.RegistroDTO;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Usuario;
import com.sportify.backend.repositories.AdministradorRepository;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.ProfesorRepository;
import com.sportify.backend.repositories.UsuarioRepository;
import com.sportify.backend.services.AlumnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AlumnoService alumnoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private ProfesorRepository profesorRepository;

    @Autowired
    private AdministradorRepository administradorRepository;

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

    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody LoginDTO loginDTO) {
        try {
            Usuario usuario = usuarioRepository.findByEmail(loginDTO.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Los datos ingresados son inválidos, debe intentarse nuevamente."));

            if (!usuario.getPassword().equals(loginDTO.getPassword())) {
                throw new IllegalArgumentException(
                        "Los datos ingresados son inválidos, debe intentarse nuevamente.");
            }

            String rol = obtenerRolUsuario(usuario.getId());

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("id", usuario.getId());
            respuesta.put("nombre", usuario.getNombre());
            respuesta.put("apellido", usuario.getApellido());
            respuesta.put("email", usuario.getEmail());
            respuesta.put("rol", rol);

            return ResponseEntity.ok(respuesta);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    private String obtenerRolUsuario(Integer idUsuario) {
        if (administradorRepository.existsById(idUsuario)) {
            return "ADMINISTRADOR";
        }

        if (profesorRepository.existsById(idUsuario)) {
            return "PROFESOR";
        }

        if (alumnoRepository.existsById(idUsuario)) {
            return "ALUMNO";
        }

        throw new IllegalArgumentException("El usuario no tiene un rol asignado.");
    }
}