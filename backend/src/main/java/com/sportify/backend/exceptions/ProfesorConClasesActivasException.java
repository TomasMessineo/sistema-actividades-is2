package com.sportify.backend.exceptions;

import com.sportify.backend.dtos.ClasePendienteDTO;

import java.util.List;

public class ProfesorConClasesActivasException extends RuntimeException {

    private final List<ClasePendienteDTO> clasesPendientes;

    public ProfesorConClasesActivasException(String mensaje, List<ClasePendienteDTO> clasesPendientes) {
        super(mensaje);
        this.clasesPendientes = clasesPendientes;
    }

    public List<ClasePendienteDTO> getClasesPendientes() {
        return clasesPendientes;
    }
}
