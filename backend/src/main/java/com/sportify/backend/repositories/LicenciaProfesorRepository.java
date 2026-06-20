package com.sportify.backend.repositories;

import com.sportify.backend.entities.LicenciaProfesor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LicenciaProfesorRepository extends JpaRepository<LicenciaProfesor, Integer> {
    List<LicenciaProfesor> findByProfesor_Id(Integer profesorId);
}
