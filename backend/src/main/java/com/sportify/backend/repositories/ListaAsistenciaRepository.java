package com.sportify.backend.repositories;

import com.sportify.backend.entities.ListaAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListaAsistenciaRepository extends JpaRepository<ListaAsistencia, Integer> {
    Optional<ListaAsistencia> findByClaseIdClase(int idClase);

    @Query(value = "SELECT la.clase_id FROM lista_asistencia la " +
                   "JOIN lista_asistencia_alumnos laa ON laa.lista_asistencia_id = la.id_lista_asistencia " +
                   "WHERE laa.alumno_id = :alumnoId AND la.clase_id IS NOT NULL",
           nativeQuery = true)
    List<Object> findClaseIdsByAlumnoId(@Param("alumnoId") Integer alumnoId);
}