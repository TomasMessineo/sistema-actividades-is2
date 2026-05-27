package com.sportify.backend.services;

import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.entities.Pago;
import com.sportify.backend.repositories.ListaAsistenciaRepository;
import com.sportify.backend.repositories.PagoRepository;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.ClaseRepository;
import com.sportify.backend.dtos.PagoRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PagoService {

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private ClaseRepository claseRepository;

    @Autowired
    private ListaAsistenciaRepository listaAsistenciaRepository;

    public Pago crearPago(PagoRequest solicitud) {
        // Si viene idPago, actualizar el pago pendiente existente en lugar de crear uno nuevo
        if (solicitud.getIdPago() != null && solicitud.getIdPago() > 0) {
            Pago pago = pagoRepository.findById(solicitud.getIdPago())
                    .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
            pago.setTipoPago(solicitud.getMetodoPago());
            return pagoRepository.save(pago);
        }

        Alumno alumno = alumnoRepository.findById(solicitud.getIdAlumno())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        Pago pago = new Pago();
        pago.setAlumno(alumno);
        pago.setValor(solicitud.getMonto());
        pago.setTipo(solicitud.getTipoPago());
        pago.setTipoPago(solicitud.getMetodoPago());
        pago.setFecha(LocalDate.now());

        if (solicitud.getTipoPago() == Pago.TipoClase.INDIVIDUAL) {
            Clase clase = claseRepository.findById(solicitud.getIdClase())
                    .orElseThrow(() -> new RuntimeException("Clase no encontrada"));
            pago.setClase(clase);
        }

        return pagoRepository.save(pago);
    }

    public Pago actualizarEstadoPago(int idPago, Pago.EstadoPago estado, String idTransaccion) {
        Pago pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));

        pago.setEstado(estado);
        pago.setIdTransaccion(idTransaccion);
        Pago pagoActualizado = pagoRepository.save(pago);

        if (estado == Pago.EstadoPago.COMPLETADO) {
            registrarAsistencia(pagoActualizado);
        }

        return pagoActualizado;
    }

    public void registrarAsistencia(Pago pago) {
        if (pago.getClase() == null || pago.getAlumno() == null) return;

        ListaAsistencia lista = listaAsistenciaRepository
                .findByClaseIdClase(pago.getClase().getIdClase())
                .orElseGet(() -> {
                    ListaAsistencia nueva = new ListaAsistencia();
                    nueva.setClase(pago.getClase());
                    nueva.setAlumnos(new ArrayList<>());
                    return nueva;
                });

        if (lista.getAlumnos() == null) {
            lista.setAlumnos(new ArrayList<>());
        }

        boolean yaInscripto = lista.getAlumnos().stream()
                .anyMatch(a -> a.getId() == pago.getAlumno().getId());

        if (!yaInscripto) {
            lista.getAlumnos().add(pago.getAlumno());
            listaAsistenciaRepository.save(lista);
        }
    }

    public Pago obtenerPagoPorId(int idPago) {
        return pagoRepository.findById(idPago)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
    }

    public List<Pago> obtenerPagosPorAlumno(int idAlumno) {
        return pagoRepository.findByAlumnoId(idAlumno);
    }

    public List<Pago> obtenerPagosPorEstado(Pago.EstadoPago estado) {
        return pagoRepository.findByEstado(estado);
    }




}