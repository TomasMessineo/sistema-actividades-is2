package com.sportify.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Alumno extends Usuario{


    @ManyToMany(mappedBy = "alumnos")
    private List<ListaAsistencia> asistencias;
    @ManyToMany(mappedBy = "alumnos")
    private List<ListaEspera> esperas;
    @OneToMany (mappedBy = "alumno")
    private List <Pago> pagos;
    @OneToMany (mappedBy = "alumno")
    private List <AptoMedico> aptosMedicos;
}
