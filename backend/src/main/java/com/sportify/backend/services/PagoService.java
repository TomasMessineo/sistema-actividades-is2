package com.sportify.backend.services;

import com.sportify.backend.dtos.AbonoPreviewDTO;
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
import org.springframework.context.annotation.Lazy;
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

    @Autowired
    @Lazy
    private ClaseService claseService;

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

        // Idempotencia: si el pago ya estaba COMPLETADO, no volver a registrar la asistencia
        boolean yaCompletado = pago.getEstado() == Pago.EstadoPago.COMPLETADO;

        pago.setEstado(estado);
        pago.setIdTransaccion(idTransaccion);
        Pago pagoActualizado = pagoRepository.save(pago);

        if (estado == Pago.EstadoPago.COMPLETADO && !yaCompletado) {
            registrarAsistencia(pagoActualizado);
        }

        return pagoActualizado;
    }

    public void registrarAsistencia(Pago pago) {
        if (pago.getClase() == null || pago.getAlumno() == null) return;

        // Si el pago es por abono mensual, inscribir en todas las clases disponibles del mes
        if (pago.getTipo() == Pago.TipoClase.ABONADO) {
            registrarAsistenciaAbono(pago);
            return;
        }

        inscribirEnClase(pago.getClase(), pago.getAlumno());
    }

    private void registrarAsistenciaAbono(Pago pago) {
        int idClaseElegida = pago.getClase().getIdClase();
        int idAlumno = pago.getAlumno().getId();

        List<AbonoPreviewDTO> preview = claseService.previewAbono(idClaseElegida, idAlumno);

        for (AbonoPreviewDTO item : preview) {
            if (!item.isDisponible()) continue;

            Clase clase = claseRepository.findById(item.getIdClase()).orElse(null);
            if (clase == null) continue;

            inscribirEnClase(clase, pago.getAlumno());
        }
    }

    private void inscribirEnClase(Clase clase, Alumno alumno) {
        ListaAsistencia lista = listaAsistenciaRepository
                .findByClaseIdClase(clase.getIdClase())
                .orElseGet(() -> {
                    ListaAsistencia nueva = new ListaAsistencia();
                    nueva.setClase(clase);
                    nueva.setAlumnos(new ArrayList<>());
                    return nueva;
                });

        if (lista.getAlumnos() == null) {
            lista.setAlumnos(new ArrayList<>());
        }

        // Usar Objects.equals para no caer en la trampa de comparar Integer con ==
        boolean yaInscripto = lista.getAlumnos().stream()
                .anyMatch(a -> java.util.Objects.equals(a.getId(), alumno.getId()));

        if (yaInscripto) {
            return;
        }

        // Validar cupo antes de insertar (defensa contra race conditions / dobles llamadas)
        int cupo = clase.getCupo() == null ? 0 : clase.getCupo();
        if (lista.getAlumnos().size() >= cupo) {
            return;
        }

        lista.getAlumnos().add(alumno);
        listaAsistenciaRepository.save(lista);
    }

    public Pago actualizarEstado(int idPago, Pago.EstadoPago estado) {
        Pago pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));

        pago.setEstado(estado);

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