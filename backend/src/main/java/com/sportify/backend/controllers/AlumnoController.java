package com.sportify.backend.controllers;

import com.sportify.backend.dtos.ClaseCalendarioDTO;
import com.sportify.backend.dtos.AptoMedicoDTO;
import com.sportify.backend.services.ClaseService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.services.AlumnoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
import java.util.List;

@RestController
@RequestMapping("/alumnos")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AlumnoController {

    @Autowired
    private ClaseService claseService;

    @Autowired
    private AlumnoService alumnoService;

    @GetMapping("/{id}/clases")
    @Transactional(readOnly = true)
    public List<ClaseCalendarioDTO> listarClasesDelAlumno(@PathVariable Integer id) {
        return claseService.listForAlumno(id).stream()
                .map(ClaseCalendarioDTO::fromEntity)
                .toList();
    }

    @GetMapping("/{id}/aptos-medicos")
    public List<AptoMedicoDTO> listarAptosMedicosDelAlumno(@PathVariable Integer id) {
        return alumnoService.listarAptosMedicos(id);
    }

    // Inasistencias del mes actual del alumno (para el menú "inasistencias restantes")
    @GetMapping("/{id}/inasistencias")
    public ResponseEntity<?> obtenerInasistencias(@PathVariable Integer id) {
        try {
            Alumno alumno = alumnoService.buscarPorId(id);
            int inasistencias = alumno.getInasistencias() == null ? 0 : alumno.getInasistencias();
            return ResponseEntity.ok(java.util.Map.of(
                    "inasistencias", inasistencias,
                    "limite", 3
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarAlumnos() {
        try {
            List<Alumno> alumnos = alumnoService.listarTodos();
            return ResponseEntity.ok(alumnos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/eliminados")
    public ResponseEntity<?> listarAlumnosEliminados() {
        try {
            List<Alumno> alumnos = alumnoService.listarEliminados();
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

    @PatchMapping("/{id}/restaurar")
    public ResponseEntity<?> restaurarAlumno(@PathVariable Integer id) {
        try {
            alumnoService.restaurar(id);
            return ResponseEntity.ok("Alumno restaurado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

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

    @PostMapping(value = "/{id}/apto-medico", consumes = "multipart/form-data")
    public ResponseEntity<?> subirAptoMedico(@PathVariable Integer id, @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(alumnoService.subirAptoMedico(id, file));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("No se pudo subir el apto médico.");
        }
    }
}
