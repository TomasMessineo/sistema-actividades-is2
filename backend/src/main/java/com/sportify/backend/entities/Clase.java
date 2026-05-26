package com.sportify.backend.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Clase {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int idClase;

    @ManyToOne
    @JoinColumn(name = "profesor_id")
    private Profesor profesor;

    @ManyToOne
    @JoinColumn(name = "actividad_id")
    private Actividad actividad;

    @OneToMany(mappedBy = "clase")
    private List<Pago> pagos;

    @OneToOne(mappedBy = "clase", cascade = CascadeType.ALL)
    private ListaEspera listaEspera;

    @OneToOne(mappedBy = "clase", cascade = CascadeType.ALL)
    private ListaAsistencia listaAsistencia;

    private int cupo;

    private LocalDate fecha;

    private Integer hora;

    private double precio;

    private boolean cancelada = false;

}
