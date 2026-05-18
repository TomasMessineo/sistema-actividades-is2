package com.sportify.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sportify.backend.entities.Alumno;

import jakarta.transaction.Transactional;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Integer> {

    List<Alumno> findByApellido(String apellido);
    List<Alumno> findByDni(String dni);
    List<Alumno> findByEmail(String email);






}
