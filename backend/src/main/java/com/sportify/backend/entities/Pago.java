package com.sportify.backend.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int idPago;

    private double valor;

    private LocalDate fecha;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;

    @ManyToOne
    @JoinColumn(name = "alumno_id")
    private Alumno alumno;

    @ManyToOne
    @JoinColumn(name = "clase_id")
    private Clase clase;

    @Enumerated(EnumType.STRING)
    private TipoClase tipo;

    public enum TipoClase {
        INDIVIDUAL,
        ABONADA
    }

    @Enumerated(EnumType.STRING)
    private TipoPago tipoPago;

    public enum TipoPago {
        MERCADOPAGO,
        TARJETADECREDITO
    }

    @Enumerated(EnumType.STRING)
    private EstadoPago estado; // NUEVO

    public enum EstadoPago {
        PENDIENTE,
        COMPLETADO,
        FALLIDO
    }

    private String idTransaccion; //  NUEVO (ID de Mercado Pago o proveedor)

    private String descripcion; // NUEVO

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        estado = EstadoPago.PENDIENTE;
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}