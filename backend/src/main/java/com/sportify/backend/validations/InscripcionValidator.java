package com.sportify.backend.validations;

import com.sportify.backend.dtos.InscripcionRequest;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.ListaAsistenciaRepository;
import com.sportify.backend.repositories.AptoMedicoRepository;
import com.sportify.backend.repositories.ClaseRepository;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

@Component
public class InscripcionValidator {

    private final AlumnoRepository alumnoRepository;
    private final ClaseRepository claseRepository;
    private final AptoMedicoRepository aptoMedicoRepository;
    private final ListaAsistenciaRepository listaAsistenciaRepository;

    public void InscripcionValidatorAll (InscripcionRequest request){
        this.alumnoExiste(request);
        this.claseExiste(request);
        this.aptoMedicoValido(request);
        this.horarioOcupado(request);
        this.cupoDisponible(request);//como aclare antes no es necesario
    }
    public InscripcionValidator(ListaAsistenciaRepository listaAsistenciaRepository, AptoMedicoRepository aptoMedicoRepository, AlumnoRepository alumnoRepository, ClaseRepository claseRepository) {
        this.alumnoRepository = alumnoRepository;
        this.claseRepository = claseRepository;
        this.listaAsistenciaRepository = listaAsistenciaRepository;
        this.aptoMedicoRepository = aptoMedicoRepository;
    }

    public void alumnoExiste(InscripcionRequest request) {
        if (!alumnoRepository.existsById(request.getIdAlumno())) {
            throw new RuntimeException("El alumno no existe");
        }
    }

    public void claseExiste(InscripcionRequest request) {
        if (!claseRepository.existsById(request.getIdClase())) {
            throw new RuntimeException("La clase no existe");
        }
    }

    public void aptoMedicoValido(InscripcionRequest request) {
        if (!aptoMedicoRepository.tieneAptoMedicoValido(request.getIdAlumno(), claseRepository.findById(request.getIdClase()).get().getFecha())) {
            throw new RuntimeException("El alumno no posee un apto medico valido");
        }
    }

    public void horarioOcupado(InscripcionRequest request) {
        Clase clase = claseRepository.findById(request.getIdClase())
                .orElseThrow(() -> new RuntimeException("La clase no existe"));

        // Verificar si el alumno ya tiene una clase a la misma hora y fecha
        listaAsistenciaRepository.findAll().stream()
                .filter(la -> la.getAlumnos().stream().anyMatch(a -> a.getId() == request.getIdAlumno()))
                .map(ListaAsistencia::getClase)
                .filter(c -> c.getFecha().equals(clase.getFecha()) && c.getHora().equals(clase.getHora()))
                .findFirst()
                .ifPresent(c -> { throw new RuntimeException("El alumno ya tiene una clase en ese horario"); });
    }

    public void cupoDisponible(InscripcionRequest request) {///  lo valida por las dudas no es necesario
        Clase clase = claseRepository.findById(request.getIdClase())
                .orElseThrow(() -> new RuntimeException("La clase no existe"));

        Optional<ListaAsistencia> lista = listaAsistenciaRepository.findByClaseIdClase(request.getIdClase());
        int inscriptos = lista.map(la -> la.getAlumnos().size()).orElse(0);

        if (inscriptos >= clase.getCupo()) {
            throw new RuntimeException("La clase no tiene cupo disponible");
        }
    }
}
