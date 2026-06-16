package com.sportify.backend.repositories;

import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.Clase;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ClaseRepository extends JpaRepository<Clase, Integer> {
    @EntityGraph(attributePaths = {"actividad", "listaAsistencia", "listaAsistencia.alumnos"})
    List<Clase> findAll();

    // Métodos agregados
    List<Clase> findByProfesorId(int idProfesor);
    List<Clase> findByActividadIdActividad(int idActividad);
    List<Clase> findByPrecio(double precio);
    List<Clase> findByFechaAndHora(LocalDate fecha, int hora);
    List<Clase> findByFechaAndHoraAndCanceladaFalse(LocalDate fecha, int hora);
    List<Clase> findByFechaAndHoraAndProfesor_Id(LocalDate fecha, int hora, Integer profesorId);
    // Métodos existentes
    List<Clase> findByFecha(LocalDate fecha);
    List<Clase> findByActividad(Actividad actividad);
    List<Clase> findByActividad_IdActividad(Integer actividadId);

    // Instancias pertenecientes a una serie (plantilla)
    List<Clase> findByPlantilla_IdPlantilla(Integer idPlantilla);
}