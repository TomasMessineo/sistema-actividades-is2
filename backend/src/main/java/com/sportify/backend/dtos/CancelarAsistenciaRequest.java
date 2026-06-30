package com.sportify.backend.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelarAsistenciaRequest {
    private int idAlumno;
    private int idClase;
}
