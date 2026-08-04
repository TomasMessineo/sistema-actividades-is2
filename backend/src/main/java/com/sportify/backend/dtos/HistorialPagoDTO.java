package com.sportify.backend.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Vista limpia de un pago para el historial del alumno.
 * Evita serializar entidades JPA (relaciones lazy) y expone
 * exactamente los campos que consume el frontend.
 */
@Getter
@Setter
@NoArgsConstructor
public class HistorialPagoDTO {

    private Integer idPago;
    private LocalDateTime fechaPago;   // fecha y hora en que se realizó el pago
    private Double monto;
    private String medioPago;          // etiqueta amigable (Mercado Pago, Tarjeta de crédito, Créditos)
    private String tipoClase;          // INDIVIDUAL | ABONADO
    private String nombreActividad;    // Yoga, Funcional, Pilates

    // Solo para abonos: todas las clases a las que quedó suscripto.
    private List<ClaseItem> clases = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ClaseItem {
        private LocalDate fecha;
        private Integer hora;
        private String profesor;
    }
}