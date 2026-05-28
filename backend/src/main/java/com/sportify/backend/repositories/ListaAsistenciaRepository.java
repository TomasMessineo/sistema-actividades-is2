package com.sportify.backend.repositories;

import com.sportify.backend.entities.ListaAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ListaAsistenciaRepository extends JpaRepository<ListaAsistencia, Integer> {
    Optional<ListaAsistencia> findByClaseIdClase(int idClase);
}