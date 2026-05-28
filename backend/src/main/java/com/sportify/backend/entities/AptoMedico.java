package com.sportify.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AptoMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "apto_medico_gen")
    @SequenceGenerator(name = "apto_medico_gen", sequenceName = "apto_medico_seq", allocationSize = 1)
    private int idAptoMedico;

    private LocalDate fechaDeVencimiento;
    private String url;

    @ManyToOne
    @JoinColumn(name = "alumno_id")
    private Alumno alumno;

}
