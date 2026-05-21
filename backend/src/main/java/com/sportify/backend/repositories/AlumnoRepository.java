package com.sportify.backend.repositories;

import com.sportify.backend.entities.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Integer> {
    // Esta interfaz queda vacía. JPA se encarga de todo el CRUD automáticamente

    Optional<Alumno> findByDni(String dni);
}