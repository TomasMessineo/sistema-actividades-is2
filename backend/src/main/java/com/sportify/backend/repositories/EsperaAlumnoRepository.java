package com.sportify.backend.repositories;

import com.sportify.backend.entities.EsperaAlumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EsperaAlumnoRepository extends JpaRepository<EsperaAlumno, Integer> {

    List<EsperaAlumno> findByAlumno_Id(Integer idAlumno);

    Optional<EsperaAlumno> findByListaEspera_IdListaEsperaAndAlumno_Id(int idListaEspera, Integer idAlumno);
}
