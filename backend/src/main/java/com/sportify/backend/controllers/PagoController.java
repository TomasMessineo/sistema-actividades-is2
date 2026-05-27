package com.sportify.backend.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sportify.backend.dtos.PagoRequest;
import com.sportify.backend.dtos.PagoResponse;
import com.sportify.backend.entities.Pago;
import com.sportify.backend.services.MercadoPagoService;
import com.sportify.backend.services.PagoService;
import com.sportify.backend.services.TarjetaCreditoService;

@RestController
@RequestMapping("/pagos")
@CrossOrigin(origins = "http://localhost:5173")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @Autowired
    private MercadoPagoService mercadoPagoService;

    @Autowired
    private TarjetaCreditoService tarjetaCreditoService;

    @PostMapping("/procesar")
    public ResponseEntity<?> procesarPago(@RequestBody PagoRequest solicitud) {
        try {
            Pago pago = pagoService.crearPago(solicitud);

            PagoResponse respuesta;

            if (solicitud.getMetodoPago() == Pago.TipoPago.MERCADOPAGO) {
                respuesta = mercadoPagoService.procesarPago(pago, solicitud);
            } else {
                respuesta = tarjetaCreditoService.procesarPago(pago, solicitud);
            }

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new PagoResponse(0, Pago.EstadoPago.FALLIDO, null, 0,
                            "Error: " + e.getMessage(), null));
        }
    }

    @GetMapping("/detalle/{idPago}")
    public ResponseEntity<?> obtenerPago(@PathVariable int idPago) {
        try {
            Pago pago = pagoService.obtenerPagoPorId(idPago);

            if (pago.getEstado() == Pago.EstadoPago.PENDIENTE && pago.getIdTransaccion() != null) {
                Pago.EstadoPago estadoMP = mercadoPagoService.verificarPorPreferencia(pago.getIdTransaccion(), pago.getIdPago());
                if (estadoMP != Pago.EstadoPago.PENDIENTE) {
                    pagoService.actualizarEstadoPago(pago.getIdPago(), estadoMP, pago.getIdTransaccion());
                    pago.setEstado(estadoMP);
                }
            }

            return ResponseEntity.ok(new PagoResponse(
                pago.getIdPago(),
                pago.getEstado(),
                pago.getIdTransaccion(),
                pago.getValor(),
                "OK",
                null
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/alumno/{idAlumno}")
    public ResponseEntity<?> obtenerPagosPorAlumno(@PathVariable int idAlumno) {
        try {
            List<Pago> pagos = pagoService.obtenerPagosPorAlumno(idAlumno);
            return ResponseEntity.ok(pagos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<?> obtenerPagosPorEstado(@PathVariable Pago.EstadoPago estado) {
        try {
            List<Pago> pagos = pagoService.obtenerPagosPorEstado(estado);
            return ResponseEntity.ok(pagos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{idPago}/expirar")
    public ResponseEntity<?> expirarPago(@PathVariable int idPago) {
        try {
            pagoService.actualizarEstado(idPago, Pago.EstadoPago.FALLIDO);
            return ResponseEntity.ok("Pago expirado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/verificar/{idPago}")
    public ResponseEntity<?> verificarPago(@PathVariable String idPago) {
        try {
            mercadoPagoService.verificarEstadoPago(idPago);
            return ResponseEntity.ok("Estado actualizado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}