package com.sportify.backend.controllers;

import com.sportify.backend.dtos.ClaseCalendarioDTO;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.services.ClaseService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/clases")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ClaseController {

    @Autowired
    private ClaseService claseService;

    @GetMapping
    @Transactional
    public List<ClaseCalendarioDTO> listar(@RequestParam(value = "alumnoId", required = false) Integer alumnoId) {
        return (alumnoId == null ? claseService.listarClases() : claseService.listAvailableForAlumno(alumnoId))
                .stream()
                .map(ClaseCalendarioDTO::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            Clase clase = claseService.buscarPorId(id);
            return ResponseEntity.ok(clase);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crearClase(@RequestBody Clase clase) {
        try {
            Clase claseCreada = claseService.crearClase(clase);
            return ResponseEntity.ok(claseCreada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            claseService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modificarClase(@PathVariable Integer id, @RequestBody Clase claseActualizada) {
        try {
            Clase claseModificada = claseService.modificarClase(claseActualizada, id);
            return ResponseEntity.ok(claseModificada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarClase(@PathVariable Integer id) {
        try {
            Clase claseCancelada = claseService.cancelarClase(id);
            return ResponseEntity.ok(claseCancelada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
