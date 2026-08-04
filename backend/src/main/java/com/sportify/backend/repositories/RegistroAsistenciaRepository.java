package com.sportify.backend.repositories;

import com.sportify.backend.entities.RegistroAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroAsistenciaRepository extends JpaRepository<RegistroAsistencia, Integer> {

    List<RegistroAsistencia> findByAlumno_IdOrderByClase_FechaDesc(Integer alumnoId);

    // Historial acotado a las clases dictadas por un profesor: un profesor solo
    // puede ver información de los alumnos inscriptos a SUS clases (HU #22/#74).
    List<RegistroAsistencia> findByAlumno_IdAndClase_Profesor_IdOrderByClase_FechaDesc(Integer alumnoId, Integer profesorId);

    Optional<RegistroAsistencia> findByAlumno_IdAndClase_IdClase(Integer alumnoId, Integer idClase);

    List<RegistroAsistencia> findByClase_IdClase(Integer idClase);
}
