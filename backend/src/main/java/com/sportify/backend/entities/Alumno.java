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

    @Column(name = "creditos")
    private Integer creditos = 0;

    @Column(name = "clases_faltadas")
    private Integer clasesFaltadas = 0;
    // Strikes del mes por cancelar tarde. A los 3 pierde el 20% de descuento del mes siguiente.
    @Column(name = "strikes")
    private Integer strikes = 0;

    // Inasistencias del mes (faltar sin avisar). A las 3 recibe penalización del 20%.
    @Column(name = "inasistencias")
    private Integer inasistencias = 0;

    @JsonIgnore
    @ManyToMany(mappedBy = "alumnos")
    private List<ListaAsistencia> asistencias;

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

    @PostLoad
    @PrePersist
    public void normalizarContadores() {
        if (creditos == null) {
            creditos = 0;
        }
        if (clasesFaltadas == null) {
            clasesFaltadas = 0;
        }
        if (strikes == null) {
            strikes = 0;
        }
        if (inasistencias == null) {
            inasistencias = 0;
        }
    }

}