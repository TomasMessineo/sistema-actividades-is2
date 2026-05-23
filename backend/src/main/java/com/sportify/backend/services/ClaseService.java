package com.sportify.backend.service;

import com.sportify.backend.entities.Clase;
import com.sportify.backend.repository.ClaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClaseService {

    @Autowired
    private ClaseRepository claseRepository;

    // 1. LISTAR
    public List<Clase> listAll() {
        return claseRepository.findAll();
    }

    public List<clase> listFromDate(LocalDate fecha) {
        return claseRepository.findByFecha(fecha).orElseThrow(() -> new RuntimeException("No hay clases para esa fecha"))
        }

    public List<clase> listFromActivity(Actividad actividad) {
        return claseRepository.findByActividad(actividad).orElseThrow(() -> new RuntimeException("No hay clases para esa actividad"))
    }

    public List<clase> listFromActivityId(Integer actividadId) {
        return claseRepository.findByActividadId(actividadId).orElseThrow(() -> new RuntimeException("No hay clases para esa actividad"))
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