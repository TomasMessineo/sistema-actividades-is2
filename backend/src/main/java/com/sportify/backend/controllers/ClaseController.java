package com.sportify.backend.controllers;

import com.sportify.backend.dtos.AbonoPreviewDTO;
import com.sportify.backend.dtos.AlumnoResumenDTO;
import com.sportify.backend.dtos.CambiarProfesorRequest;
import com.sportify.backend.dtos.CancelarDesdeRequest;
import com.sportify.backend.dtos.CancelarRangoRequest;
import com.sportify.backend.dtos.ClaseCalendarioDTO;
import com.sportify.backend.dtos.ClaseCancelacionResponse;
import com.sportify.backend.dtos.ClasePlantillaRequest;
import com.sportify.backend.dtos.ClaseSerieResponse;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.services.ClaseService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.transaction.annotation.Transactional;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/clases")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ClaseController {

    @Autowired
    private ClaseService claseService;

    @GetMapping
    @Transactional
    public List<ClaseCalendarioDTO> listar(
            @RequestParam(value = "alumnoId", required = false) Integer alumnoId,
            @RequestParam(value = "desde", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(value = "hasta", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        // Lazy: si se pide una ventana, materializamos las instancias faltantes antes de leer.
        boolean conRango = desde != null && hasta != null;
        if (conRango) {
            claseService.materializarRango(desde, hasta);
        }

        return (alumnoId == null ? claseService.listarClases() : claseService.listAvailableForAlumno(alumnoId))
                .stream()
                .filter(clase -> {
                    if (!conRango) {
                        return true;
                    }
                    LocalDate fecha = clase.getFecha();
                    return fecha != null && !fecha.isBefore(desde) && !fecha.isAfter(hasta);
                })
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

    // Crea una serie perpetua (plantilla) y genera sus instancias semanales.
    @PostMapping("/plantilla")
    public ResponseEntity<?> crearSerie(@RequestBody ClasePlantillaRequest request) {
        try {
            ClaseSerieResponse respuesta = claseService.crearSerie(request);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Cambia el profesor de una clase individual o de toda la serie.
    @PutMapping("/{id}/profesor")
    public ResponseEntity<?> cambiarProfesor(@PathVariable Integer id, @RequestBody CambiarProfesorRequest request) {
        try {
            ClaseCalendarioDTO clase = claseService.cambiarProfesor(id, request);
            return ResponseEntity.ok(clase);
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
            ClaseCancelacionResponse respuesta = claseService.cancelarClaseConDetalle(id);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Cancela todas las instancias de una serie dentro de un rango de fechas
    // (materializa las que falten antes de cancelarlas).
    @PatchMapping("/plantilla/{idPlantilla}/cancelar-rango")
    public ResponseEntity<?> cancelarRangoSerie(@PathVariable Integer idPlantilla, @RequestBody CancelarRangoRequest request) {
        try {
            ClaseCancelacionResponse respuesta = claseService.cancelarRangoSerie(idPlantilla, request);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Corta la vigencia de una serie a partir de una fecha y cancela las
    // instancias ya materializadas en o después de esa fecha.
    @PatchMapping("/plantilla/{idPlantilla}/cancelar-desde")
    public ResponseEntity<?> cancelarDesdeSerie(@PathVariable Integer idPlantilla, @RequestBody CancelarDesdeRequest request) {
        try {
            ClaseCancelacionResponse respuesta = claseService.cancelarDesdeSerie(idPlantilla, request);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Alumnos anotados en una clase puntual.
    @GetMapping("/{id}/alumnos")
    @Transactional(readOnly = true)
    public ResponseEntity<?> listarAlumnosDeClase(@PathVariable Integer id) {
        try {
            List<AlumnoResumenDTO> alumnos = claseService.listarAlumnosDeClase(id);
            return ResponseEntity.ok(alumnos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/abono/preview")
    @Transactional
    public ResponseEntity<?> previewAbono(
            @RequestParam("idClase") Integer idClase,
            @RequestParam(value = "idAlumno", required = false) Integer idAlumno
    ) {
        try {
            List<AbonoPreviewDTO> preview = claseService.previewAbono(idClase, idAlumno);
            return ResponseEntity.ok(preview);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
