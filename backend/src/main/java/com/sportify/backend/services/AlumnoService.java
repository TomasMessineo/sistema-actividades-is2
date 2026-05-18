package com.sportify.backend.services;

import com.sportify.backend.entities.Alumno;
import com.sportify.backend.repositories.AlumnoRepository;

import java.util.List;

public class AlumnoService {

    private AlumnoRepository repositorio;


    public AlumnoService(AlumnoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Alumno> getAlumnos() {
        return repositorio.findAll();
    }

    public List<Alumno> findAll() {
        return repositorio.findAll();
    }

    public Alumno findById(Integer id) {
        return repositorio.findById(id).get();
    }

    public Alumno addAlumno(Alumno alumno) {
        return repositorio.save(alumno);
    }

    public Alumno updateAlumno(Alumno alumno) {
        return repositorio.save(alumno);
    }

    public void deleteAlumno(Alumno alumno) {
        repositorio.delete(alumno);
    }


}
