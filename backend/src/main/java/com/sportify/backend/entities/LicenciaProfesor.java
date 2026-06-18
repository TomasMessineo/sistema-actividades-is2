package com.sportify.backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Período en el que un profesor NO está disponible para dar clases
 * (p. ej. vacaciones). Un profesor está no-disponible en una fecha si ésta cae
 * dentro de alguna de sus licencias [desde, hasta] (ambos inclusive).
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LicenciaProfesor {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "licencia_profesor_gen")
    @SequenceGenerator(name = "licencia_profesor_gen", sequenceName = "licencia_profesor_seq", allocationSize = 1)
    private Integer idLicencia;

    @ManyToOne(optional = false)
    @JoinColumn(name = "profesor_id")
    private Profesor profesor;

    @Column(nullable = false)
    private LocalDate desde;

    @Column(nullable = false)
    private LocalDate hasta;

    private String motivo;
}
