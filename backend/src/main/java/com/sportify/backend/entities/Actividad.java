package com.sportify.backend.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Actividad {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "actividad_gen")
    @SequenceGenerator(name = "actividad_gen", sequenceName = "actividad_seq", allocationSize = 1)
    private Integer idActividad;

    @Enumerated(EnumType.STRING)
    private TipoActividad tipo;

    private Double precio;

    public enum TipoActividad {
        YOGA,
        PILATES,
        FUNCIONAL
    }

    @JsonIgnore
    @OneToMany(mappedBy = "actividad")
    private List<Clase> clases;



}
