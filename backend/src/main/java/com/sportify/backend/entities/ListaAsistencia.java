package com.sportify.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;


@Entity
@Getter@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ListaAsistencia {


    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "lista_asistencia_gen")
    @SequenceGenerator(name = "lista_asistencia_gen", sequenceName = "lista_asistencia_seq", allocationSize = 1)
    private int idListaAsistencia;


    @ManyToMany
    @JoinTable(
            name = "lista_asistencia_alumnos",
            joinColumns = @JoinColumn(name = "lista_asistencia_id"),
            inverseJoinColumns = @JoinColumn(name = "alumno_id")
    )
    private List<Alumno> alumnos;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "clase_id")
    private Clase clase;
}
