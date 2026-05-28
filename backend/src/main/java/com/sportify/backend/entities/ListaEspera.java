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
public class ListaEspera {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int idListaEspera;

    @ManyToMany
    @JoinTable(
            name = "lista_espera_alumnos",
            joinColumns = @JoinColumn(name = "lista_espera_id"),
            inverseJoinColumns = @JoinColumn(name = "alumno_id")
    )
    private List<Alumno> alumnos;

    @OneToOne
    @JoinColumn(name = "clase_id")
    private Clase clase;
}