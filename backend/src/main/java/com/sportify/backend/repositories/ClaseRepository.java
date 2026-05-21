package com.sportify.backend.repository;

import com.sportify.backend.entities.Clase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaseRepository extends JpaRepository<Clase, Integer> {
    // Esta interfaz queda vacía. JPA se encarga de todo el CRUD automáticamente
}