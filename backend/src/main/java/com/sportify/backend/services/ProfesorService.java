package com.sportify.backend.services;

import com.sportify.backend.entities.Profesor;
import com.sportify.backend.repositories.ProfesorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfesorService {

    @Autowired
    private ProfesorRepository profesorRepository;

    public List<Profesor> listarTodos() {
        return profesorRepository.findAll();
    }

    public List<Profesor> listarPorActividad(Integer idActividad) {
        return profesorRepository.findByActividad_IdActividad(idActividad);
    }

    public Profesor buscarPorId(Integer id) {
        return profesorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
    }
}
