package com.sportify.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Clase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer idClase;

    @ManyToOne
    @JoinColumn(name = "profesor_id")
    private Profesor profesor;

    @ManyToOne
    @JoinColumn(name = "actividad_id")
    private Actividad actividad;

    @JsonIgnore
    @OneToMany(mappedBy = "clase")
    private List<Pago> pagos;

    @OneToOne(mappedBy = "clase", cascade = CascadeType.ALL)
    private ListaEspera listaEspera;

    @OneToOne(mappedBy = "clase", cascade = CascadeType.ALL)
    private ListaAsistencia listaAsistencia;

    private Integer cupo;

    private LocalDate fecha;

    private Integer hora;

    @Column(nullable = false)
    private Double precio;

    public void prePersistPrecio(){
        if (this.precio == null){
            this.precio = 0.0;
        }
    }


    @Column(nullable = false)
    private Boolean cancelada = false;

    @PrePersist
    public void prePersistCancelada() {
        if (this.cancelada == null) {
            this.cancelada = false;
        }
    }
}