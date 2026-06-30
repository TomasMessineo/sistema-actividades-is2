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

    @PostMapping
    public ResponseEntity<?> crearActividad(@RequestBody Map<String, Object> payload) {
        String tipoRaw = (String) payload.get("tipo");
        if (tipoRaw == null || tipoRaw.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre de la disciplina es obligatorio");
        }

        String tipo = tipoRaw.trim();
        boolean existe = actividadRepository.findAll().stream()
                .anyMatch(a -> tipo.equalsIgnoreCase(a.getTipo()));

        if (existe) {
            return ResponseEntity.badRequest().body("La Disciplina no ha sido añadida debido a que la misma ya se encuentra en el sistema");
        }

        Object precioObj = payload.get("precio");
        Double precio = 0.0;
        if (precioObj instanceof Number) {
            precio = ((Number) precioObj).doubleValue();
        } else if (precioObj instanceof String) {
            try {
                precio = Double.parseDouble((String) precioObj);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Tarifa inválida");
            }
        }
        if (precio < 0) {
            return ResponseEntity.badRequest().body("La tarifa no puede ser negativa");
        }

        Actividad nueva = new Actividad();
        nueva.setTipo(tipo.toUpperCase());
        nueva.setPrecio(precio);
        actividadRepository.save(nueva);

        return ResponseEntity.ok(Map.of(
                "message", "La disciplina ha sido añadida correctamente",
                "actividad", nueva
        ));
    }
}
