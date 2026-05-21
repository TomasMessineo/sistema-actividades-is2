package com.sportify.backend.services;

import com.sportify.backend.entities.Alumno;
import com.sportify.backend.repositories.AlumnoRepository;
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
        // Buscamos si ya existe un alumno con el mismmo DNI
        alumnoRepository.findByDni(alumno.getDni()).ifPresent(alumnoExistente -> {
            // Si el DNI existe y NO es el mismo alumno que estamos editando (ID diferente o es una creación de ID cero/null)
            if (alumno.getId() == 0 || alumno.getId() != alumnoExistente.getId()) {
                throw new IllegalArgumentException("La cuenta no ha podido crearse debido a que el DNI ya se encuentra registrado en el sistema");
            }
        });
        
        // Si no existe duplicado real, se crea o actualiza el alumno sin problemas
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