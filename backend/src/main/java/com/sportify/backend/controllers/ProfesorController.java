package com.sportify.backend.controllers;

import com.sportify.backend.dtos.RegistroProfesorDTO;
import com.sportify.backend.entities.Profesor;
import com.sportify.backend.exceptions.ProfesorConClasesActivasException;
import com.sportify.backend.services.ProfesorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/profesores")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfesorController {

    @Autowired
    private ProfesorService profesorService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarProfesor(@RequestBody RegistroProfesorDTO dto) {
        try {
            Profesor creado = profesorService.registrar(dto);
            return new ResponseEntity<>(convertirADto(creado), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarProfesores() {
        List<Map<String, Object>> profesores = profesorService.listarTodos()
                .stream()
                .map(this::convertirADto)
                .toList();

        return ResponseEntity.ok(profesores);
    }

    @GetMapping("/eliminados")
    public ResponseEntity<List<Map<String, Object>>> listarProfesoresEliminados() {
        List<Map<String, Object>> profesores = profesorService.listarEliminados()
                .stream()
                .map(this::convertirADto)
                .toList();

        return ResponseEntity.ok(profesores);
    }

    @GetMapping("/actividad/{idActividad}")
    public ResponseEntity<List<Map<String, Object>>> listarPorActividad(@PathVariable Integer idActividad) {
        List<Map<String, Object>> profesores = profesorService.listarPorActividad(idActividad)
                .stream()
                .map(this::convertirADto)
                .toList();

        return ResponseEntity.ok(profesores);
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivarProfesor(@PathVariable Integer id) {
        try {
            profesorService.desactivar(id);
            return ResponseEntity.ok(Map.of("mensaje", "Profesor eliminado correctamente"));
        } catch (ProfesorConClasesActivasException e) {
            Map<String, Object> body = new HashMap<>();
            body.put("mensaje", e.getMessage());
            body.put("clasesPendientes", e.getClasesPendientes());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("mensaje", e.getMessage()));
        }
    }

    private Map<String, Object> convertirADto(Profesor profesor) {
        Map<String, Object> dto = new HashMap<>();

        dto.put("id", profesor.getId());
        dto.put("nombre", profesor.getNombre());
        dto.put("apellido", profesor.getApellido());
        dto.put("email", profesor.getEmail());
        dto.put("dni", profesor.getDni());

        if (profesor.getActividad() != null) {
            Map<String, Object> actividadDto = new HashMap<>();
            actividadDto.put("idActividad", profesor.getActividad().getIdActividad());
            actividadDto.put("tipo", profesor.getActividad().getTipo());
            dto.put("actividad", actividadDto);
        }

        return dto;
    }
}
