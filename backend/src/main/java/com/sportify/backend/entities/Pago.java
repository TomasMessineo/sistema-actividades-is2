package com.sportify.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;



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

}
