package com.sportify.backend.services;

import com.sportify.backend.entities.Alumno;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.validations.AlumnoValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlumnoService {

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private AlumnoValidator alumnoValidator;

    // 1. LISTAR
    public List<Alumno> listarTodos() {
        return alumnoRepository.findAll();
    }

    // 2. AGREGAR / GUARDAR
    public Alumno guardar(Alumno alumno) {
        
        // Delegamos todas las validaciones de negocio a nuestra clase especializada
        alumnoValidator.validarRegistro(alumno);
        
        // Si no se arrojó ninguna excepción, se crea o actualiza el alumno sin problemas
        return alumnoRepository.save(alumno);
    }

    // 3. BUSCAR POR ID
    public Alumno buscarPorId(Integer id) {
        return alumnoRepository.findById(id).orElseThrow(() -> new RuntimeException("Alumno no encontrado"));
    }

    // 4. ELIMINAR
    public void eliminar(Integer id) {
        alumnoRepository.deleteById(id);
    }
}