package com.sportify.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;


@Entity
@Getter@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ListaAsistencia {


    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int idListaAsistencia;


    @ManyToMany
    @JoinTable(
            name = "lista_asistencia_alumnos",
            joinColumns = @JoinColumn(name = "lista_asistencia_id"),
            inverseJoinColumns = @JoinColumn(name = "alumno_id")
    )
    private List<Alumno> alumnos;

    @OneToOne
    @JoinColumn(name = "clase_id")
    private Clase clase;
}
