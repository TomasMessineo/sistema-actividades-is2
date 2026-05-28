package com.sportify.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InscripcionResponse {
    private int idPago;
    private String estado;
    private String mensaje;
    private double monto;
    private Integer creditosRestantes;
}