package com.sportify.backend.controllers;

import com.sportify.backend.entities.Alumno;
import com.sportify.backend.services.AlumnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alumnos")
@CrossOrigin(origins = "http://localhost:5173")
public class AlumnoController {

    @Autowired
    private AlumnoService alumnoService;

    @GetMapping
    public ResponseEntity<?> listarAlumnos() {
        try {
            List<Alumno> alumnos = alumnoService.listarTodos();
            return ResponseEntity.ok(alumnos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivarAlumno(@PathVariable Integer id) {
        try {
            alumnoService.desactivar(id);
            return ResponseEntity.ok("Alumno desactivado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
