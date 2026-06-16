package com.sportify.backend.controllers;

import com.sportify.backend.entities.Profesor;
import com.sportify.backend.services.ProfesorService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarProfesores() {
        List<Map<String, Object>> profesores = profesorService.listarTodos()
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

    private Map<String, Object> convertirADto(Profesor profesor) {
        Map<String, Object> dto = new HashMap<>();

        dto.put("id", profesor.getId());
        dto.put("nombre", profesor.getNombre());
        dto.put("apellido", profesor.getApellido());
        dto.put("email", profesor.getEmail());

        if (profesor.getActividad() != null) {
            Map<String, Object> actividadDto = new HashMap<>();
            actividadDto.put("idActividad", profesor.getActividad().getIdActividad());
            actividadDto.put("tipo", profesor.getActividad().getTipo());
            dto.put("actividad", actividadDto);
        }

        return dto;
    }
}