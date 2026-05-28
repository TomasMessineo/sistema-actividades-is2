package com.sportify.backend.dtos;

import com.sportify.backend.entities.Pago;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InscripcionRequest {
    private int idAlumno;
    private int idClase;
    private Pago.TipoClase tipoClase;
    private Pago.TipoPago metodoPago;
}