package com.sportify.backend.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.sportify.backend.entities.Alumno;
import jakarta.transaction.Transactional;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Integer> {

    @Query("SELECT a FROM Alumno a WHERE a.activo = true AND a.id NOT IN (SELECT ad.id FROM Administrador ad)")
    List<Alumno> findByActivoTrue();

    @Query("SELECT a FROM Alumno a WHERE a.activo = false AND a.id NOT IN (SELECT ad.id FROM Administrador ad)")
    List<Alumno> findByActivoFalse();

    List<Alumno> findByApellido(String apellido);

    Optional<Alumno> findByDni(String dni);

    Optional<Alumno> findByEmail(String email);


}
