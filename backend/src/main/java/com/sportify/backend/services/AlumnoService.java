package com.sportify.backend.service;

import com.sportify.backend.entities.Alumno;
import com.sportify.backend.repository.AlumnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlumnoService {

    @Autowired
    private AlumnoRepository alumnoRepository;

    // 1. LISTAR
    public List<Alumno> listarTodos() {
        return alumnoRepository.findAll();
    }

    // 2. AGREGAR / GUARDAR
    public Alumno guardar(Alumno alumno) {
        return alumnoRepository.save(alumno);
    }

    // 3. BUSCAR POR ID
    public Alumno buscarPorId(Integer id) {
        return alumnoRepository.findById(id).orElseThrow(() -> new RuntimeException("Alumno no encontrado"));
    }

    // 4. ELIMINAR (¡Acá está el que faltaba!)
    public void eliminar(Integer id) {
        alumnoRepository.deleteById(id);
    }
}