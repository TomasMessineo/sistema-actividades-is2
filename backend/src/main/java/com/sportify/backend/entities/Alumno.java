package com.sportify.backend.entities;

import jakarta.persistence.*;
import lombok.experimental.SuperBuilder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;
import java.time.LocalDate;
import java.time.Period;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Alumno extends Usuario {

    private LocalDate fechaNacimiento;

    @ManyToMany(mappedBy = "alumnos")
    private List<ListaAsistencia> asistencias;
    @ManyToMany(mappedBy = "alumnos")
    private List<ListaEspera> esperas;
    @OneToMany(mappedBy = "alumno")
    private List<Pago> pagos;
    @OneToMany(mappedBy = "alumno")
    private List<AptoMedico> aptosMedicos;

}