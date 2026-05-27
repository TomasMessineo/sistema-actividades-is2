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

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Alumno extends com.sportify.backend.entities.Usuario {

    private LocalDate fechaNacimiento;

    private int Creditos;

    @JsonIgnore
    @ManyToMany(mappedBy = "alumnos")
    private List<ListaAsistencia> asistencias;
    
    @JsonIgnore
    @ManyToMany(mappedBy = "alumnos")
    private List<ListaEspera> esperas;
    
    @JsonIgnore
    @OneToMany(mappedBy = "alumno")
    private List<Pago> pagos;
    
    @JsonIgnore
    @OneToMany(mappedBy = "alumno")
    private List<AptoMedico> aptosMedicos;

    @Transient
    public String getRol() {
        return "ALUMNO";
    }

}