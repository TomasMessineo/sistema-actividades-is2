package com.sportify.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Column;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
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
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "clase_gen")
    @SequenceGenerator(name = "clase_gen", sequenceName = "clase_seq", allocationSize = 1)
    private Integer idClase;

    @ManyToOne
    @JoinColumn(name = "profesor_id")
    private Profesor profesor;

    @ManyToOne
    @JoinColumn(name = "actividad_id")
    private Actividad actividad;

    // Serie a la que pertenece esta instancia. Null = clase suelta (one-off).
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "plantilla_id")
    private ClasePlantilla plantilla;

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

    @Column(nullable = false)
    private Boolean cancelada = false;

    // True una vez que se barrieron los alumnos sin escanear y se les marcó
    // falto=true al terminar la clase. Evita reprocesar la misma clase en
    // cada corrida del scheduler. Sin nullable=false a nivel de columna: las
    // clases ya existentes en la base no tienen valor, y el repositorio las
    // trata como "no finalizada" (ver ClaseRepository).
    private Boolean asistenciaFinalizada = false;

    @PrePersist
    public void prePersist() {
        if (this.precio == null) {
            this.precio = 0.0;
        }

        if (this.cancelada == null) {
            this.cancelada = false;
        }

        if (this.asistenciaFinalizada == null) {
            this.asistenciaFinalizada = false;
        }
    }
}
