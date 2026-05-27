package com.sportify.backend.services;

import com.sportify.backend.dtos.ListaEsperaRequest;
import com.sportify.backend.dtos.ListaEsperaResponse;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.entities.ListaEspera;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.AptoMedicoRepository;
import com.sportify.backend.repositories.ClaseRepository;
import com.sportify.backend.repositories.ListaAsistenciaRepository;
import com.sportify.backend.repositories.ListaEsperaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class ListaEsperaService {

    private final AlumnoRepository alumnoRepository;
    private final ClaseRepository claseRepository;
    private final ListaEsperaRepository listaEsperaRepository;
    private final ListaAsistenciaRepository listaAsistenciaRepository;
    private final AptoMedicoRepository aptoMedicoRepository;

    public ListaEsperaService(
            AlumnoRepository alumnoRepository,
            ClaseRepository claseRepository,
            ListaEsperaRepository listaEsperaRepository,
            ListaAsistenciaRepository listaAsistenciaRepository,
            AptoMedicoRepository aptoMedicoRepository) {
        this.alumnoRepository = alumnoRepository;
        this.claseRepository = claseRepository;
        this.listaEsperaRepository = listaEsperaRepository;
        this.listaAsistenciaRepository = listaAsistenciaRepository;
        this.aptoMedicoRepository = aptoMedicoRepository;
    }

    @Transactional
    public ListaEsperaResponse inscribir(ListaEsperaRequest request) {
        Alumno alumno = alumnoRepository.findById(request.getIdAlumno())
                .orElseThrow(() -> new RuntimeException("El alumno no existe"));

        Clase clase = claseRepository.findById(request.getIdClase())
                .orElseThrow(() -> new RuntimeException("La clase no existe"));

        if (!aptoMedicoRepository.tieneAptoMedicoValido(request.getIdAlumno(), clase.getFecha())) {
            throw new RuntimeException("Tu certificado médico no es válido para la fecha de la clase");
        }

        listaAsistenciaRepository.findAll().stream()
                .filter(la -> la.getAlumnos() != null &&
                        la.getAlumnos().stream().anyMatch(a -> a.getId() == request.getIdAlumno()))
                .map(ListaAsistencia::getClase)
                .filter(c -> c.getFecha().equals(clase.getFecha()) && c.getHora().equals(clase.getHora()))
                .findFirst()
                .ifPresent(c -> { throw new RuntimeException("Ya estás anotado a otra clase en ese horario"); });

        ListaEspera lista = listaEsperaRepository.findByClaseIdClase(request.getIdClase())
                .orElseGet(() -> {
                    ListaEspera nueva = new ListaEspera();
                    nueva.setClase(clase);
                    nueva.setAlumnos(new ArrayList<>());
                    return nueva;
                });

        if (lista.getAlumnos() == null) lista.setAlumnos(new ArrayList<>());

        boolean yaEnLista = lista.getAlumnos().stream().anyMatch(a -> a.getId() == request.getIdAlumno());
        if (yaEnLista) {
            throw new RuntimeException("Ya estás en la lista de espera de esta clase");
        }

        lista.getAlumnos().add(alumno);
        ListaEspera guardada = listaEsperaRepository.save(lista);

        int posicion = guardada.getAlumnos().size();
        return new ListaEsperaResponse(
                guardada.getIdListaEspera(),
                "Te anotamos en la lista de espera. Tu posición: " + posicion,
                posicion);
    }
}
