package com.sportify.backend.services;

import com.sportify.backend.dtos.InscripcionRequest;
import com.sportify.backend.dtos.InscripcionResponse;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.Pago;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.ClaseRepository;
import com.sportify.backend.repositories.PagoRepository;
import com.sportify.backend.validations.InscripcionValidator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class InscripcionService {

    // estos son los repositorios — son los que hablan con la base de datos
    private final AlumnoRepository alumnoRepository;
    private final ClaseRepository claseRepository;
    private final PagoRepository pagoRepository;
    private final InscripcionValidator inscripcionValidator;
    private final PagoService pagoService;

    public InscripcionService(AlumnoRepository alumnoRepository, ClaseRepository claseRepository, PagoRepository pagoRepository, InscripcionValidator inscripcionValidator, PagoService pagoService) {
        this.alumnoRepository = alumnoRepository;
        this.claseRepository = claseRepository;
        this.pagoRepository = pagoRepository;
        this.inscripcionValidator = inscripcionValidator;
        this.pagoService = pagoService;
    }

    public InscripcionResponse iniciarInscripcion(InscripcionRequest request) {
        try {
            inscripcionValidator.InscripcionValidatorAll(request);
            Alumno alumno = alumnoRepository.findById(request.getIdAlumno()).get();
            Clase clase = claseRepository.findById(request.getIdClase()).get();

            Pago pago = new Pago();
            pago.setAlumno(alumno);
            pago.setClase(clase);
            pago.setFecha(LocalDate.now());
            pago.setTipoPago(request.getMetodoPago());

            if (request.getMetodoPago() == Pago.TipoPago.CREDITOS) {
                if (alumno.getCreditos() <= 0) {
                    throw new RuntimeException("No tenés créditos disponibles");
                }
                alumno.setCreditos(alumno.getCreditos() - 1);
                alumnoRepository.save(alumno);
                pago.setValor(0.0);
                pago.setEstado(Pago.EstadoPago.COMPLETADO);
                pago.setDescripcion("Inscripción con crédito");
                Pago pagoGuardado = pagoRepository.save(pago);
                pagoService.registrarAsistencia(pagoGuardado);
                return new InscripcionResponse(
                        pagoGuardado.getIdPago(),
                        pagoGuardado.getEstado().toString(),
                        "Inscripción confirmada con crédito",
                        0,
                        alumno.getCreditos());
            }

            pago.setValor(clase.getPrecio());
            pago.setEstado(Pago.EstadoPago.PENDIENTE);
            Pago pagoGuardado = pagoRepository.save(pago);

            return new InscripcionResponse(
                    pagoGuardado.getIdPago(),
                    pagoGuardado.getEstado().toString(),
                    "Pago en proceso",
                    pagoGuardado.getValor(),
                    null);
        } catch (Exception e) {
            throw new RuntimeException("Error de Inscripcion: " + e.getMessage());
        }
    }
}