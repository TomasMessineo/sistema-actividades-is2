package com.sportify.backend.repository;

import com.sportify.backend.entities.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Integer> {
    // Esta interfaz queda vacía. JPA se encarga de todo el CRUD automáticamente
}