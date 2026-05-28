package com.sportify.backend.repositories;

import com.sportify.backend.entities.ListaEspera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ListaEsperaRepository extends JpaRepository<ListaEspera, Integer> {
    Optional<ListaEspera> findByClaseIdClase(int idClase);
}
