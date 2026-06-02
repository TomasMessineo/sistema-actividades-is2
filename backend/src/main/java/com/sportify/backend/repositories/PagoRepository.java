package com.sportify.backend.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sportify.backend.entities.Pago;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {

    List<Pago> findByAlumnoId(int idAlumno);

    List<Pago> findByEstado(Pago.EstadoPago estado);

    Pago findByIdTransaccion(String idTransaccion);

    boolean existsByAlumnoIdAndEstadoAndClaseCanceladaFalseAndClaseFechaGreaterThanEqual(
            int idAlumno, Pago.EstadoPago estado, LocalDate fecha);

}