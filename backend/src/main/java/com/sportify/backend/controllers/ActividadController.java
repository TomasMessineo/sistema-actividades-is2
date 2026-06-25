package com.sportify.backend.controllers;

import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.ClasePlantilla;
import com.sportify.backend.repositories.ActividadRepository;
import com.sportify.backend.repositories.ClasePlantillaRepository;
import com.sportify.backend.repositories.ClaseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/actividades")
@CrossOrigin(origins = "http://localhost:5173")
public class ActividadController {

    private final ActividadRepository actividadRepository;
    private final ClaseRepository claseRepository;
    private final ClasePlantillaRepository clasePlantillaRepository;

    public ActividadController(ActividadRepository actividadRepository,
            ClaseRepository claseRepository,
            ClasePlantillaRepository clasePlantillaRepository) {
        this.actividadRepository = actividadRepository;
        this.claseRepository = claseRepository;
        this.clasePlantillaRepository = clasePlantillaRepository;
    }

    @GetMapping
    public List<Actividad> getActividades() {
        return actividadRepository.findAll();
    }

    @PutMapping("/{id}/precio")
    @Transactional
    public ResponseEntity<?> ajustarPrecio(@PathVariable Integer id, @RequestBody Map<String, Double> payload) {
        Actividad actividad = actividadRepository.findById(id).orElse(null);
        if (actividad == null) {
            return ResponseEntity.notFound().build();
        }

        Double nuevoPrecio = payload.get("precio");
        if (nuevoPrecio == null || nuevoPrecio < 0) {
            return ResponseEntity.badRequest().body("Precio inválido");
        }

        // 1. Update activity price
        actividad.setPrecio(nuevoPrecio);
        actividadRepository.save(actividad);

        // 2. Update all templates (ClasePlantilla) of this activity
        List<ClasePlantilla> plantillas = clasePlantillaRepository.findAll().stream()
                .filter(p -> p.getActividad() != null && p.getActividad().getIdActividad().equals(id))
                .toList();
        for (ClasePlantilla plantilla : plantillas) {
            plantilla.setPrecio(nuevoPrecio);
        }
        clasePlantillaRepository.saveAll(plantillas);

        // 3. Update all classes (Clase) of this activity
        List<Clase> clases = claseRepository.findByActividad_IdActividad(id);
        for (Clase clase : clases) {
            clase.setPrecio(nuevoPrecio);
        }
        claseRepository.saveAll(clases);

        return ResponseEntity.ok(actividad);
    }
}
