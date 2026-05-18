package com.sportify.backend.entities;


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
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int idActividad;

    @Enumerated(EnumType.STRING)
    private TipoActividad tipo;

    public enum TipoActividad {
        YOGA,
        PILATES,
        FUNCIONAL
    }

    @OneToMany(mappedBy = "actividad")
    private List<Clase> clases;



}
