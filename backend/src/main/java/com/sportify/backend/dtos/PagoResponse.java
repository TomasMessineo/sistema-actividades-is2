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
public class PagoResponse {

    private int idPago;
    private Pago.EstadoPago estado;
    private String idTransaccion;
    private double monto;
    private String mensaje;
    private String urlRedireccion;
}