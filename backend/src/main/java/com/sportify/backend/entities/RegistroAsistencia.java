package com.sportify.backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Registro de asistencia de un alumno a una clase puntual. Se crea (o
 * actualiza) cuando el profesor pasa asistencia para esa clase; no implica
 * inscripción (eso lo maneja ListaAsistencia).
 */
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"alumno_id", "clase_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistroAsistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "registro_asistencia_gen")
    @SequenceGenerator(name = "registro_asistencia_gen", sequenceName = "registro_asistencia_seq", allocationSize = 1)
    private Integer idRegistroAsistencia;

    @ManyToOne
    @JoinColumn(name = "alumno_id")
    private Alumno alumno;

    @ManyToOne
    @JoinColumn(name = "clase_id")
    private Clase clase;

    @Column(nullable = false)
    private Boolean falto = false;

    @PrePersist
    public void prePersist() {
        if (this.falto == null) {
            this.falto = false;
        }
    }
}
