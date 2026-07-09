package com.sportify.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Reserva de cupo mensual por renovación: "este alumno tiene guardado su lugar
 * en esta serie ({@link ClasePlantilla}) para un mes concreto".
 *
 * Se crea al iniciar un mes para cada alumno que tuvo un abono COMPLETADO de esa
 * serie el mes anterior (ver scheduler en ClaseService). Da prioridad a los que
 * ya venían pagando: mientras la reserva esté PENDIENTE, su lugar cuenta como
 * ocupado para los alumnos nuevos, pero queda libre para su dueño. Cuando el
 * alumno paga el abono del mes, su reserva pasa a CONFIRMADA y se lo inscribe.
 *
 * Es por SERIE (plantilla), no por alumno: un alumno abonado a yoga y pilates
 * puede renovar una y no la otra, y cada reserva es independiente.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservaCupo {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reserva_cupo_gen")
    @SequenceGenerator(name = "reserva_cupo_gen", sequenceName = "reserva_cupo_seq", allocationSize = 1)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "alumno_id")
    private Alumno alumno;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "plantilla_id")
    private ClasePlantilla plantilla;

    // Mes reservado (el mes de las clases cuyo cupo se guarda).
    private Integer anio;
    private Integer mes;

    @Enumerated(EnumType.STRING)
    private EstadoReserva estado = EstadoReserva.PENDIENTE;

    public enum EstadoReserva {
        PENDIENTE,   // lugar guardado, el alumno todavía no pagó el abono del mes
        CONFIRMADA   // el alumno pagó y quedó inscripto
        // A futuro se puede agregar VENCIDA + fechaLimite si se decide que la
        // reserva no dure todo el mes.
    }

    private LocalDate fechaCreacion;

    @PrePersist
    public void prePersist() {
        if (this.estado == null) {
            this.estado = EstadoReserva.PENDIENTE;
        }
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDate.now();
        }
    }
}