package com.sportify.backend.services;

import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.repositories.ClaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaseService {

    @Autowired
    private ClaseRepository claseRepository;

    // 1. LISTAR
    public List<Clase> listAll() {
        return claseRepository.findAll();
    }

    public List<Clase> listAvailableForAlumno(Integer alumnoId) {
        if (alumnoId == null) {
            return listAll();
        }

        return listAll().stream()
                .filter(clase -> !isAlumnoEnrolled(clase, alumnoId))
                .collect(Collectors.toList());
    }

    private boolean isAlumnoEnrolled(Clase clase, Integer alumnoId) {
        if (clase.getListaAsistencia() == null || clase.getListaAsistencia().getAlumnos() == null) {
            return false;
        }

        return clase.getListaAsistencia().getAlumnos().stream()
                .map(Alumno::getId)
                .anyMatch(id -> id == alumnoId);
    }

    public List<Clase> listFromDate(LocalDate fecha) {
        return claseRepository.findByFecha(fecha);
        }

    public List<Clase> listFromActivity(Actividad actividad) {
        return claseRepository.findByActividad(actividad);
    }

    public List<Clase> listFromActivityId(Integer actividadId) {
        return claseRepository.findByActividad_IdActividad(actividadId);
    }

    // 2. AGREGAR / GUARDAR
    public Clase guardar(Clase clase) {
        return claseRepository.save(clase);
    }

    // 3. BUSCAR POR ID
    public Clase buscarPorId(Integer id) {
        return claseRepository.findById(id).orElseThrow(() -> new RuntimeException("Clase no encontrada"));
    }

    // 4. ELIMINAR
    public void eliminar(Integer id) {
        claseRepository.deleteById(id);
    }
}