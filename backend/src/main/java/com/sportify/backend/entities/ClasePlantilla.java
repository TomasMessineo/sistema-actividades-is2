package com.sportify.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

/**
 * "Clase en general": la serie perpetua que se repite todas las semanas en un
 * día y hora fijos. No tiene una fecha concreta; de ella cuelgan las
 * {@link Clase} (instancias / "clase particular") que sí ocurren en una fecha.
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClasePlantilla {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "clase_plantilla_gen")
    @SequenceGenerator(name = "clase_plantilla_gen", sequenceName = "clase_plantilla_seq", allocationSize = 1)
    private Integer idPlantilla;

    @ManyToOne
    @JoinColumn(name = "actividad_id")
    private Actividad actividad;

    @ManyToOne
    @JoinColumn(name = "profesor_id")
    private Profesor profesor;

    @Enumerated(EnumType.STRING)
    private DayOfWeek diaSemana;

    private Integer hora;

    private Integer cupo;

    @Column(nullable = false)
    private Double precio;

    @Column(nullable = false)
    private Boolean activa = true;

    private LocalDate vigenciaDesde;

    private LocalDate vigenciaHasta;

    @JsonIgnore
    @OneToMany(mappedBy = "plantilla")
    private List<Clase> instancias;

    @PrePersist
    public void prePersist() {
        if (this.precio == null) {
            this.precio = 0.0;
        }
        if (this.activa == null) {
            this.activa = true;
        }
    }
}
