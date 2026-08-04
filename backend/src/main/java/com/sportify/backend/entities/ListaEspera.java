package com.sportify.backend.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "lista_espera_gen")
    @SequenceGenerator(name = "lista_espera_gen", sequenceName = "lista_espera_seq", allocationSize = 1)
    private int idListaEspera;

    @OneToMany(mappedBy = "listaEspera", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EsperaAlumno> integrantes;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "clase_id")
    private Clase clase;
}