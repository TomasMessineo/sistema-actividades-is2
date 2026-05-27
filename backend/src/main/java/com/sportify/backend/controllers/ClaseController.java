package com.sportify.backend.controllers;

import com.sportify.backend.dtos.ClaseCalendarioDTO;
import com.sportify.backend.services.ClaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sportify.backend.entities.Clase;
import com.sportify.backend.services.ClaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/clases")
@CrossOrigin(origins = "http://localhost:5173")
public class ClaseController {

    @Autowired
    private ClaseService claseService;

    @GetMapping
    public List<ClaseCalendarioDTO> listar(@RequestParam(value = "alumnoId", required = false) Integer alumnoId) {
        return claseService.listAvailableForAlumno(alumnoId).stream()
                .map(ClaseCalendarioDTO::fromEntity)
                .toList();
    // 1. LISTAR TODAS LAS CLASES
    @GetMapping
    public ResponseEntity<List<Clase>> listarClases() {
        return ResponseEntity.ok(claseService.listarClases());
    }

    // 2. BUSCAR CLASE POR ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            Clase clase = claseService.buscarPorId(id);
            return ResponseEntity.ok(clase);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. LISTAR CLASES POR FECHA Y HORA
    @GetMapping("/fecha-hora")
    public ResponseEntity<List<Clase>> listarClasesDeUnaFechaYHora(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam int hora
    ) {
        return ResponseEntity.ok(claseService.listarClasesDeUnaFechaYHora(fecha, hora));
    }

    // 4. LISTAR CLASES POR ID DE ACTIVIDAD
    @GetMapping("/actividad/{actividadId}")
    public ResponseEntity<List<Clase>> listarPorIdActividad(@PathVariable Integer actividadId) {
        return ResponseEntity.ok(claseService.listarPorIdActividad(actividadId));
    }

    // 5. CREAR CLASE
    @PostMapping
    public ResponseEntity<?> crearClase(@RequestBody Clase clase) {
        try {
            Clase claseCreada = claseService.crearClase(clase);
            return ResponseEntity.ok(claseCreada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 6. ELIMINAR CLASE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            claseService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //7. MODIFICAR CLASE

    @PutMapping("/{id}")
    public ResponseEntity<?> modificarClase(@PathVariable Integer id, @RequestBody Clase claseActualizada) {
        try {
            Clase claseModificada = claseService.modificarClase(claseActualizada, id);
            return ResponseEntity.ok(claseModificada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
