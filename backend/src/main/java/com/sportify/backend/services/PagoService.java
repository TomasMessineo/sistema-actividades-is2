package com.sportify.backend.services;

import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.Pago;
import com.sportify.backend.repositories.PagoRepository;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.ClaseRepository;
import com.sportify.backend.dtos.PagoRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class PagoService {

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;  // ← Cambié nombre

    @Autowired
    private ClaseRepository claseRepository;    // ← Cambié nombre

    public Pago crearPago(PagoRequest solicitud) {
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

        return pagoRepository.save(pago);
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