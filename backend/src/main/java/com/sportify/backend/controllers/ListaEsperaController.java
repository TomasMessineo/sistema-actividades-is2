package com.sportify.backend.controllers;

import com.sportify.backend.dtos.CancelarAsistenciaRequest;
import com.sportify.backend.dtos.ClaseEnEsperaDTO;
import com.sportify.backend.dtos.ConfirmarAsistenciaRequest;
import com.sportify.backend.dtos.ListaEsperaRequest;
import com.sportify.backend.dtos.ListaEsperaResponse;
import com.sportify.backend.entities.Pago;
import com.sportify.backend.services.ListaEsperaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/lista-espera")
@CrossOrigin(origins = "http://localhost:5173")
public class ListaEsperaController {

    private final ListaEsperaService listaEsperaService;

    public ListaEsperaController(ListaEsperaService listaEsperaService) {
        this.listaEsperaService = listaEsperaService;
    }

    @PostMapping("/inscribir")
    public ResponseEntity<?> inscribir(@RequestBody ListaEsperaRequest request) {
        try {
            ListaEsperaResponse response = listaEsperaService.inscribir(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Visualizar las clases en las que el alumno está en lista de espera
    @GetMapping("/alumno/{idAlumno}")
    public ResponseEntity<?> listarPorAlumno(@PathVariable Integer idAlumno) {
        try {
            List<ClaseEnEsperaDTO> clases = listaEsperaService.listarPorAlumno(idAlumno);
            return ResponseEntity.ok(clases);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Confirmar asistencia desde la lista de espera (solo si tiene acceso habilitado)
    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmar(@RequestBody ConfirmarAsistenciaRequest request) {
        try {
            if (request.getMetodoPago() == Pago.TipoPago.CREDITOS) {
                ListaEsperaService.InscripcionResponseConfirmacion resp =
                        listaEsperaService.confirmarConCredito(request.getIdAlumno(), request.getIdClase());
                return ResponseEntity.ok(Map.of("mensaje", resp.getMensaje()));
            }

            // Camino de pago: solo validamos el acceso; el frontend redirige a "Pagar Clase Individual"
            listaEsperaService.validarAccesoParaPago(request.getIdAlumno(), request.getIdClase());
            return ResponseEntity.ok(Map.of("mensaje", "Acceso válido, redirigiendo al pago"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Cancelar la asistencia de un alumno ya inscripto (escenarios 4 y 5)
    @PostMapping("/cancelar-asistencia")
    public ResponseEntity<?> cancelarAsistencia(@RequestBody CancelarAsistenciaRequest request) {
        try {
            String mensaje = listaEsperaService.cancelarAsistencia(request.getIdAlumno(), request.getIdClase());
            return ResponseEntity.ok(Map.of("mensaje", mensaje));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
