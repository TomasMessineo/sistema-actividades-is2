package com.sportify.backend.repositories;

import com.sportify.backend.entities.ReservaCupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaCupoRepository extends JpaRepository<ReservaCupo, Integer> {

    // Reservas de una serie en un mes (para contar la ocupación de sus clases).
    List<ReservaCupo> findByPlantilla_IdPlantillaAndAnioAndMesAndEstado(
            Integer idPlantilla, Integer anio, Integer mes, ReservaCupo.EstadoReserva estado);

    // ¿Este alumno tiene reserva (en el estado dado) para esta serie ese mes?
    Optional<ReservaCupo> findByAlumno_IdAndPlantilla_IdPlantillaAndAnioAndMesAndEstado(
            Integer idAlumno, Integer idPlantilla, Integer anio, Integer mes, ReservaCupo.EstadoReserva estado);

    boolean existsByAlumno_IdAndPlantilla_IdPlantillaAndAnioAndMes(
            Integer idAlumno, Integer idPlantilla, Integer anio, Integer mes);
}