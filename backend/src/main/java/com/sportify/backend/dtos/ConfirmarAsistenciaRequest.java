package com.sportify.backend.dtos;

import com.sportify.backend.entities.Pago;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmarAsistenciaRequest {
    private int idAlumno;
    private int idClase;
    // CREDITOS si paga con crédito; null/otro si va por el flujo de pago
    private Pago.TipoPago metodoPago;
}
