package com.sportify.backend.repositories;

import com.sportify.backend.entities.AptoMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface AptoMedicoRepository extends JpaRepository<AptoMedico, Integer> {

    @Query("SELECT COUNT(a) > 0 FROM AptoMedico a WHERE a.alumno.id = :idAlumno AND a.fechaDeVencimiento >= :fechaClase")
    boolean tieneAptoMedicoValido(@Param("idAlumno") int idAlumno, @Param("fechaClase") LocalDate fechaClase);}