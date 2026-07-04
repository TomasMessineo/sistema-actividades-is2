package com.sportify.backend.services;

import com.sportify.backend.dtos.AbonoPreviewDTO;
import com.sportify.backend.dtos.HistorialPagoDTO;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.entities.Pago;
import com.sportify.backend.repositories.EsperaAlumnoRepository;
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
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
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
    private EsperaAlumnoRepository esperaAlumnoRepository;

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

        // Si el alumno venía de la lista de espera de esta clase, lo sacamos de la cola.
        esperaAlumnoRepository.findByAlumno_Id(alumno.getId()).stream()
                .filter(ea -> ea.getListaEspera() != null
                        && ea.getListaEspera().getClase() != null
                        && ea.getListaEspera().getClase().getIdClase() == clase.getIdClase())
                .forEach(esperaAlumnoRepository::delete);
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

    /**
     * Historial de pagos YA REALIZADOS (COMPLETADO) del alumno, como DTOs listos
     * para el frontend. Cada pago es una fila; los abonos incluyen la lista de
     * todas las clases a las que quedó suscripto.
     */
    @Transactional(readOnly = true)
    public List<HistorialPagoDTO> obtenerHistorialPorAlumno(int idAlumno) {
        List<Pago> pagos = pagoRepository.findByAlumnoId(idAlumno);

        // Clases en las que el alumno está realmente inscripto (fuente de verdad,
        // igual que el calendario). Los abonos se arman a partir de esto.
        List<Clase> clasesInscriptas = obtenerClasesInscriptas(idAlumno);

        List<HistorialPagoDTO> historial = new ArrayList<>();

        for (Pago pago : pagos) {
            // Solo mostramos pagos concretados: pendientes/fallidos no van al historial.
            if (pago.getEstado() != Pago.EstadoPago.COMPLETADO) {
                continue;
            }

            HistorialPagoDTO dto = new HistorialPagoDTO();
            dto.setIdPago(pago.getIdPago());
            dto.setFechaPago(fechaHoraPago(pago));
            dto.setMonto(pago.getValor());
            dto.setMedioPago(etiquetaMedioPago(pago.getTipoPago()));
            dto.setTipoClase(pago.getTipo() != null ? pago.getTipo().name() : null);

            Clase clase = pago.getClase();
            if (clase != null) {
                dto.setNombreActividad(nombreActividad(clase));

                if (pago.getTipo() == Pago.TipoClase.ABONADO) {
                    // Abono: todas las clases en las que quedó inscripto por ese abono.
                    dto.setClases(clasesDelAbono(clase, clasesInscriptas));
                } else {
                    // Individual: la única clase pagada.
                    dto.setClases(List.of(toClaseItem(clase)));
                }
            }

            historial.add(dto);
        }

        // Más recientes primero.
        historial.sort(Comparator
                .comparing(HistorialPagoDTO::getFechaPago, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(HistorialPagoDTO::getIdPago, Comparator.nullsLast(Comparator.reverseOrder())));

        return historial;
    }

    private LocalDateTime fechaHoraPago(Pago pago) {
        if (pago.getFechaCreacion() != null) {
            return pago.getFechaCreacion();
        }
        return pago.getFecha() != null ? pago.getFecha().atStartOfDay() : null;
    }

    private List<Clase> obtenerClasesInscriptas(int idAlumno) {
        List<Object> ids = listaAsistenciaRepository.findClaseIdsByAlumnoId(idAlumno);
        List<Integer> claseIds = new ArrayList<>();
        for (Object id : ids) {
            if (id != null) {
                claseIds.add(((Number) id).intValue());
            }
        }
        if (claseIds.isEmpty()) {
            return new ArrayList<>();
        }
        return claseRepository.findAllById(claseIds);
    }

    /**
     * Clases de un abono: las clases en las que el alumno quedó realmente
     * inscripto que pertenecen a la misma serie (plantilla) y mes que la clase
     * elegida. Coincide con lo que muestra el calendario.
     */
    private List<HistorialPagoDTO.ClaseItem> clasesDelAbono(Clase claseElegida, List<Clase> clasesInscriptas) {
        List<HistorialPagoDTO.ClaseItem> items = new ArrayList<>();
        if (claseElegida.getFecha() == null) {
            return items;
        }
        YearMonth mesAbono = YearMonth.from(claseElegida.getFecha());
        Integer idPlantilla = claseElegida.getPlantilla() != null
                ? claseElegida.getPlantilla().getIdPlantilla() : null;
        Integer idActividad = claseElegida.getActividad() != null
                ? claseElegida.getActividad().getIdActividad() : null;

        clasesInscriptas.stream()
                .filter(c -> c.getFecha() != null && YearMonth.from(c.getFecha()).equals(mesAbono))
                .filter(c -> perteneceAlAbono(c, idPlantilla, idActividad))
                .sorted(Comparator.comparing(Clase::getFecha)
                        .thenComparing(c -> c.getHora() == null ? 0 : c.getHora()))
                .forEach(c -> items.add(toClaseItem(c)));

        return items;
    }

    private boolean perteneceAlAbono(Clase clase, Integer idPlantilla, Integer idActividad) {
        // Preferimos la serie (plantilla); si la clase elegida no tenía, caemos a la actividad.
        if (idPlantilla != null) {
            return clase.getPlantilla() != null
                    && idPlantilla.equals(clase.getPlantilla().getIdPlantilla());
        }
        return idActividad != null && clase.getActividad() != null
                && idActividad.equals(clase.getActividad().getIdActividad());
    }

    private HistorialPagoDTO.ClaseItem toClaseItem(Clase clase) {
        HistorialPagoDTO.ClaseItem item = new HistorialPagoDTO.ClaseItem();
        item.setFecha(clase.getFecha());
        item.setHora(clase.getHora());
        item.setProfesor(nombreProfesor(clase));
        return item;
    }

    private String nombreActividad(Clase clase) {
        if (clase.getActividad() != null && clase.getActividad().getTipo() != null) {
            return clase.getActividad().getTipo().name();
        }
        return null;
    }

    private String nombreProfesor(Clase clase) {
        if (clase.getProfesor() == null) {
            return null;
        }
        String nombre = clase.getProfesor().getNombre();
        String apellido = clase.getProfesor().getApellido();
        String completo = ((nombre != null ? nombre : "") + " " + (apellido != null ? apellido : "")).trim();
        return completo.isEmpty() ? null : completo;
    }

    private String etiquetaMedioPago(Pago.TipoPago tipoPago) {
        if (tipoPago == null) {
            return null;
        }
        switch (tipoPago) {
            case MERCADOPAGO:
                return "Mercado Pago";
            case TARJETADECREDITO:
                return "Tarjeta de crédito";
            case CREDITOS:
                return "Créditos";
            default:
                return tipoPago.name();
        }
    }

    public List<Pago> obtenerPagosPorEstado(Pago.EstadoPago estado) {
        return pagoRepository.findByEstado(estado);
    }




}