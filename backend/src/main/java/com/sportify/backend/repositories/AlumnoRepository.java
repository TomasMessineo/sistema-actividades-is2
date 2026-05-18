package com.sportify.backend.repositories;

import com.sportify.backend.entities.Alumno;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Integer> {

    List<Alumno> findbyId(Integer id);
    List<Alumno> findByApellido(String apellido);
    List<Alumno> findByDni(String dni);
    List<Alumno> findByEmail(String email);


    @Transactional
    void deleteById(Integer id);






}
