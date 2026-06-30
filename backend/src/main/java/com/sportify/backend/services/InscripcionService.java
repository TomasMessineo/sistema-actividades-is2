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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import com.sportify.backend.dtos.AbonoPreviewDTO;

@Service
public class InscripcionService {

    // estos son los repositorios — son los que hablan con la base de datos
    private final AlumnoRepository alumnoRepository;
    private final ClaseRepository claseRepository;
    private final PagoRepository pagoRepository;
    private final InscripcionValidator inscripcionValidator;
    private final PagoService pagoService;
    private final ClaseService claseService;

    public InscripcionService(AlumnoRepository alumnoRepository, ClaseRepository claseRepository, PagoRepository pagoRepository, InscripcionValidator inscripcionValidator, PagoService pagoService, ClaseService claseService) {
        this.alumnoRepository = alumnoRepository;
        this.claseRepository = claseRepository;
        this.pagoRepository = pagoRepository;
        this.inscripcionValidator = inscripcionValidator;
        this.pagoService = pagoService;
        this.claseService = claseService;
    }

    @Transactional
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
            pago.setTipo(request.getTipoClase() != null ? request.getTipoClase() : Pago.TipoClase.INDIVIDUAL);

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

            double precio = clase.getPrecio() != null ? clase.getPrecio() : 0.0;
            if (pago.getTipo() == Pago.TipoClase.ABONADO) {
                long cantidadClases = 1;
                if (clase.getPlantilla() != null) {
                    java.util.List<AbonoPreviewDTO> preview = claseService.previewAbono(clase.getIdClase(), alumno.getId());
                    cantidadClases = preview.stream().filter(AbonoPreviewDTO::isDisponible).count();
                }
                double totalSinDescuento = precio * cantidadClases;

                double factor = 1.0;
                int inasistencias = alumno.getInasistencias() == null ? 0 : alumno.getInasistencias();
                int strikes = alumno.getStrikes() == null ? 0 : alumno.getStrikes();

                if (inasistencias >= 3) {
                    factor = 1.2;
                } else if (strikes < 3) {
                    if (cantidadClases >= 4) {
                        factor = 0.8;
                    } else if (cantidadClases == 3) {
                        factor = 0.85;
                    } else if (cantidadClases == 2) {
                        factor = 0.9;
                    } else {
                        factor = 1.0;
                    }
                } else {
                    factor = 1.0;
                }

                precio = totalSinDescuento * factor;
            }
            pago.setValor(precio);
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