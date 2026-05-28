package com.sportify.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ListaEsperaResponse {
    private int idListaEspera;
    private String mensaje;
    private int posicion;
}
