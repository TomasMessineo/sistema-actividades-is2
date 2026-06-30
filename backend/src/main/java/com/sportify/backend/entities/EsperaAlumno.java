package com.sportify.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EsperaAlumno {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "espera_alumno_gen")
    @SequenceGenerator(name = "espera_alumno_gen", sequenceName = "espera_alumno_seq", allocationSize = 1)
    private Integer id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "lista_espera_id")
    private ListaEspera listaEspera;

    @ManyToOne
    @JoinColumn(name = "alumno_id")
    private Alumno alumno;

    // Posición en la cola: 1 = primero en llegar
    private Integer posicion;

    // Se habilita en true cuando se libera un cupo y es el turno de este alumno
    private Boolean tieneAcceso = false;
}
