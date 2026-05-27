package com.sportify.backend.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalTime;
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

    private double precio;

    private LocalTime hora; //no hay horario de hora fin, porque en teoria todas las clases son de 1h.

    private boolean cancelada = false;

}
