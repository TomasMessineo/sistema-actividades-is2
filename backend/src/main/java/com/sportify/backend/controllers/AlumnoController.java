package com.sportify.backend.controllers;

import com.sportify.backend.dtos.ActualizarPerfilAlumnoDTO;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.services.AlumnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/alumnos")
@CrossOrigin(origins = "http://localhost:5173")
public class AlumnoController {

    @Autowired
    private AlumnoService alumnoService;

    @PutMapping("/{id}/perfil")
    public ResponseEntity<?> actualizarPerfil(@PathVariable Integer id, @RequestBody ActualizarPerfilAlumnoDTO datos) {
        try {
            Alumno alumnoActualizado = alumnoService.actualizarPerfil(id, datos);
            return ResponseEntity.ok(alumnoActualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping(value = "/{id}/foto-perfil", consumes = "multipart/form-data")
    public ResponseEntity<?> actualizarFotoDePerfil(@PathVariable Integer id, @RequestParam("file") MultipartFile file) {
        try {
            Alumno alumnoActualizado = alumnoService.actualizarFotoDePerfil(id, file);
            return ResponseEntity.ok(alumnoActualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("No se pudo subir la foto de perfil.");
        }
    }
}