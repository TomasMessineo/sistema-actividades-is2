package com.sportify.backend.dtos;

import com.sportify.backend.entities.Pago;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PagoRequest {

    private int idAlumno;
    private Pago.TipoClase tipoPago;
    private Pago.TipoPago metodoPago;
    private Integer idClase;
    private double monto;
    private String emailAlumno;

    // Para tarjeta de crédito
    private String numeroTarjeta;
    private String nombreTitular;
    private String fechaVencimiento;
    private String cvv;
}