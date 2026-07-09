package com.sportify.backend.services;

import com.sportify.backend.dtos.AbonoPreviewDTO;
import com.sportify.backend.dtos.AlumnoAsistenciaDTO;
import com.sportify.backend.dtos.AlumnoResumenDTO;
import com.sportify.backend.dtos.CambiarProfesorRequest;
import com.sportify.backend.dtos.ClaseActualProfesorDTO;
import com.sportify.backend.dtos.CancelarDesdeRequest;
import com.sportify.backend.dtos.CancelarRangoRequest;
import com.sportify.backend.dtos.ClaseCalendarioDTO;
import com.sportify.backend.dtos.ClaseCancelacionResponse;
import com.sportify.backend.dtos.ClasePlantillaRequest;
import com.sportify.backend.dtos.ClaseSerieResponse;
import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.ClasePlantilla;
import com.sportify.backend.entities.LicenciaProfesor;
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.entities.Pago;
import com.sportify.backend.entities.Profesor;
import com.sportify.backend.entities.RegistroAsistencia;
import com.sportify.backend.repositories.ActividadRepository;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.ClasePlantillaRepository;
import com.sportify.backend.repositories.ClaseRepository;
import com.sportify.backend.repositories.LicenciaProfesorRepository;
import com.sportify.backend.entities.ReservaCupo;
import com.sportify.backend.repositories.PagoRepository;
import com.sportify.backend.repositories.ListaAsistenciaRepository;
import com.sportify.backend.repositories.ProfesorRepository;
import com.sportify.backend.repositories.RegistroAsistenciaRepository;
import com.sportify.backend.repositories.ReservaCupoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ClaseService {

    private static final ZoneId BUENOS_AIRES_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    @Autowired
    private ClaseRepository claseRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private RegistroAsistenciaRepository registroAsistenciaRepository;

    @Autowired
    private ClasePlantillaRepository clasePlantillaRepository;

    @Autowired
    private ProfesorRepository profesorRepository;

    @Autowired
    private LicenciaProfesorRepository licenciaProfesorRepository;

    @Autowired
    private ActividadRepository actividadRepository;

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private ListaAsistenciaRepository listaAsistenciaRepository;

    @Autowired
    private EmailService emailService;
    private ReservaCupoRepository reservaCupoRepository;

    // 1. LISTAR
    public List<Clase> listarClases() {
        return claseRepository.findAll();
    }

    private List<Clase> listAll() {
        return listarClases();
    }

    public List<Clase> listForAlumno(Integer alumnoId) {
        if (alumnoId == null) {
            return List.of();
        }

        return listAll().stream()
                .filter(clase -> !Boolean.TRUE.equals(clase.getCancelada()))
                .filter(clase -> clase.getListaAsistencia() != null
                        && clase.getListaAsistencia().getAlumnos() != null
                        && clase.getListaAsistencia().getAlumnos().stream()
                                .anyMatch(alumno -> java.util.Objects.equals(alumno.getId(), alumnoId)))
                .collect(Collectors.toList());
    }

    public List<Clase> listAvailableForAlumno(Integer alumnoId) {
        LocalDate hoy = LocalDate.now();

        if (alumnoId == null) {
            return listAll().stream()
                    .filter(clase -> !Boolean.TRUE.equals(clase.getCancelada()))
                    .filter(clase -> clase.getFecha() != null && !clase.getFecha().isBefore(hoy))
                    .collect(Collectors.toList());
        }

        return listAll().stream()
                .filter(clase -> !Boolean.TRUE.equals(clase.getCancelada()))
                .filter(clase -> clase.getFecha() != null && !clase.getFecha().isBefore(hoy))
                .filter(clase -> !isAlumnoEnrolled(clase, alumnoId))
                .filter(clase -> !isAlumnoInWaitingList(clase, alumnoId))
                .collect(Collectors.toList());
    }

    private boolean isAlumnoEnrolled(Clase clase, Integer alumnoId) {
        if (clase.getListaAsistencia() == null || clase.getListaAsistencia().getAlumnos() == null) {
            return false;
        }

        return clase.getListaAsistencia().getAlumnos().stream()
                .map(Alumno::getId)
                .anyMatch(id -> java.util.Objects.equals(id, alumnoId));
    }

    // ============================================================
    // VISTA SEMANAL POR PLANTILLA (para inscripción mensual / abono)
    // ============================================================
    // Devuelve un slot por serie (ClasePlantilla activa) para la semana pedida.
    // A diferencia de listAvailableForAlumno, NO oculta la serie por inscripción
    // individual: solo la oculta si el alumno ya tiene un abono de esa serie este mes.
    // Si la instancia de la semana está cancelada, apunta a la próxima instancia
    // no cancelada del mes.
    @Transactional
    public List<ClaseCalendarioDTO> listarSemanaPorPlantilla(LocalDate desde, LocalDate hasta, Integer alumnoId) {
        if (desde == null || hasta == null) {
            return List.of();
        }

        // Materializamos la semana y el resto del mes (para poder apuntar a la
        // próxima instancia si la de esta semana está cancelada).
        LocalDate finDeMes = desde.withDayOfMonth(desde.lengthOfMonth());
        LocalDate hastaMaterializar = hasta.isAfter(finDeMes) ? hasta : finDeMes;
        materializarRango(desde, hastaMaterializar);

        Set<Integer> plantillasAbonadas = plantillasConAbonoDelMes(alumnoId, desde);

        List<ClaseCalendarioDTO> resultado = new ArrayList<>();
        for (ClasePlantilla plantilla : clasePlantillaRepository.findAll()) {
            if (!Boolean.TRUE.equals(plantilla.getActiva())) {
                continue;
            }
            // Si ya tiene abono de esta serie este mes, la ocultamos.
            if (plantillasAbonadas.contains(plantilla.getIdPlantilla())) {
                continue;
            }

            Clase representativa = elegirInstanciaRepresentativa(plantilla, desde, hasta, finDeMes);
            if (representativa == null) {
                continue;
            }

            ClaseCalendarioDTO dto = ClaseCalendarioDTO.fromEntity(representativa);
            List<AbonoPreviewDTO> preview = previewAbono(representativa.getIdClase(), alumnoId);
            boolean abonoDisponible = preview.stream().anyMatch(AbonoPreviewDTO::isDisponible);
            dto.setAbonoDisponible(abonoDisponible);

            // Distinguir "no hay cupo" de "el alumno ya tiene clase en ese
            // horario": si todas las clases restantes chocan con su agenda, el
            // cupo puede estar libre y no corresponde mostrar la serie llena.
            if (!abonoDisponible) {
                boolean todoConflicto = !preview.isEmpty() && preview.stream()
                        .allMatch(p -> p.getMotivo() == AbonoPreviewDTO.Motivo.CONFLICTO_HORARIO);
                dto.setMotivoAbonoNoDisponible(todoConflicto ? "CONFLICTO_HORARIO" : "LLENA");
            }

            // El contador refleja la ocupación real: inscriptos + lugares
            // guardados por renovación (sin contar la reserva del propio alumno).
            dto.setInscritos(ocupacion(representativa, alumnoId));
            dto.setTieneReserva(alumnoTieneReservaPendiente(representativa, alumnoId));

            resultado.add(dto);
        }
        return resultado;
    }

    // Instancia que representa a la serie en la semana: la de esta semana si no está
    // cancelada; si lo está (o no hay), la próxima no cancelada del mes.
    private Clase elegirInstanciaRepresentativa(ClasePlantilla plantilla, LocalDate desde, LocalDate hasta, LocalDate finDeMes) {
        List<Clase> instancias = claseRepository.findByPlantilla_IdPlantilla(plantilla.getIdPlantilla());

        Clase semanal = instancias.stream()
                .filter(c -> c.getFecha() != null
                        && !c.getFecha().isBefore(desde)
                        && !c.getFecha().isAfter(hasta))
                .filter(c -> !Boolean.TRUE.equals(c.getCancelada()))
                .findFirst()
                .orElse(null);
        if (semanal != null) {
            return semanal;
        }

        return instancias.stream()
                .filter(c -> c.getFecha() != null
                        && !c.getFecha().isBefore(desde)
                        && !c.getFecha().isAfter(finDeMes))
                .filter(c -> !Boolean.TRUE.equals(c.getCancelada()))
                .sorted(Comparator.comparing(Clase::getFecha))
                .findFirst()
                .orElse(null);
    }

    // Series (plantillas) donde el alumno ya tiene un abono COMPLETADO en el mes de referencia.
    private Set<Integer> plantillasConAbonoDelMes(Integer alumnoId, LocalDate referencia) {
        if (alumnoId == null) {
            return Set.of();
        }
        YearMonth mes = YearMonth.from(referencia);
        return pagoRepository.findByAlumnoId(alumnoId).stream()
                .filter(p -> p.getEstado() == Pago.EstadoPago.COMPLETADO)
                .filter(p -> p.getTipo() == Pago.TipoClase.ABONADO)
                .filter(p -> p.getClase() != null && p.getClase().getPlantilla() != null)
                .filter(p -> p.getClase().getFecha() != null
                        && YearMonth.from(p.getClase().getFecha()).equals(mes))
                .map(p -> p.getClase().getPlantilla().getIdPlantilla())
                .collect(Collectors.toSet());
    }

    private boolean isAlumnoInWaitingList(Clase clase, Integer alumnoId) {
        if (clase.getListaEspera() == null || clase.getListaEspera().getIntegrantes() == null) {
            return false;
        }

        return clase.getListaEspera().getIntegrantes().stream()
                .filter(ea -> ea.getAlumno() != null)
                .map(ea -> ea.getAlumno().getId())
                .anyMatch(id -> java.util.Objects.equals(id, alumnoId));
    }

    // HELPER — true si la clase ya empezó (o terminó) según el reloj de Buenos
    // Aires. Nadie puede inscribirse ni anotarse en espera a una clase pasada.
    public boolean claseYaComenzo(Clase clase) {
        if (clase.getFecha() == null || clase.getHora() == null) {
            return false;
        }
        return !clase.getFecha().atTime(clase.getHora(), 0)
                .isAfter(LocalDateTime.now(BUENOS_AIRES_ZONE));
    }

    // HELPER — true si la clase ya alcanzó su cupo, contando la ocupación real
    // (inscriptos + reservas de renovación pendientes). Para un alumno nuevo.
    private boolean claseLlena(Clase clase) {
        return claseLlenaParaAlumno(clase, null);
    }

    // HELPER — igual que claseLlena pero para un alumno concreto. Quien tiene
    // reserva pendiente de esta serie/mes solo compite contra los inscriptos
    // reales: su lugar está garantizado y el de los demás reservados también
    // (con datos consistentes reservas <= cupo). Además evita el bloqueo mutuo
    // si hubiera más reservas que cupo: gana el primero que paga.
    private boolean claseLlenaParaAlumno(Clase clase, Integer alumnoId) {
        int cupo = clase.getCupo() != null ? clase.getCupo() : 0;
        if (alumnoTieneReservaPendiente(clase, alumnoId)) {
            return idsInscriptos(clase).size() >= cupo;
        }
        return ocupacion(clase, alumnoId) >= cupo;
    }

    // HELPER — ocupación de una clase: cantidad de lugares tomados = alumnos
    // inscriptos + alumnos con reserva de renovación PENDIENTE para la serie y
    // el mes de esta clase (que todavía no están inscriptos). Si se pasa
    // alumnoExcluir, no se cuenta su reserva (para no bloquearlo a él mismo).
    private int ocupacion(Clase clase, Integer alumnoExcluir) {
        Set<Integer> inscriptos = idsInscriptos(clase);
        int reservados = (int) reservasPendientes(clase).stream()
                .map(r -> r.getAlumno() != null ? r.getAlumno().getId() : null)
                .filter(java.util.Objects::nonNull)
                .filter(id -> !inscriptos.contains(id))          // ya contado como inscripto
                .filter(id -> !java.util.Objects.equals(id, alumnoExcluir))
                .distinct()
                .count();
        return inscriptos.size() + reservados;
    }

    private Set<Integer> idsInscriptos(Clase clase) {
        if (clase.getListaAsistencia() == null || clase.getListaAsistencia().getAlumnos() == null) {
            return new HashSet<>();
        }
        return clase.getListaAsistencia().getAlumnos().stream()
                .map(Alumno::getId)
                .collect(Collectors.toCollection(HashSet::new));
    }

    // HELPER — true si el alumno tiene su cupo guardado (ReservaCupo PENDIENTE)
    // para la serie y el mes de esta clase.
    private boolean alumnoTieneReservaPendiente(Clase clase, Integer alumnoId) {
        if (alumnoId == null) {
            return false;
        }
        return reservasPendientes(clase).stream()
                .anyMatch(r -> r.getAlumno() != null
                        && java.util.Objects.equals(r.getAlumno().getId(), alumnoId));
    }

    // Reservas de renovación PENDIENTES que aplican al cupo de esta clase: las de
    // su misma serie (plantilla) en su mismo mes. Las clases sueltas (sin serie)
    // no participan de la renovación.
    private List<ReservaCupo> reservasPendientes(Clase clase) {
        if (clase.getPlantilla() == null || clase.getFecha() == null) {
            return List.of();
        }
        return reservaCupoRepository.findByPlantilla_IdPlantillaAndAnioAndMesAndEstado(
                clase.getPlantilla().getIdPlantilla(),
                clase.getFecha().getYear(),
                clase.getFecha().getMonthValue(),
                ReservaCupo.EstadoReserva.PENDIENTE);
    }

    // HELPER — true si el alumno ya está inscripto en OTRA clase en la misma fecha
    // y hora.
    private boolean alumnoTieneOtraClaseEnHorario(Integer alumnoId, Clase clase) {
        if (alumnoId == null) return false;
        List<Integer> claseIds = listaAsistenciaRepository.findClaseIdsByAlumnoId(alumnoId)
                .stream()
                .map(obj -> ((Number) obj).intValue())
                .collect(Collectors.toList());
        if (claseIds.isEmpty()) return false;
        return claseRepository.findAllById(claseIds).stream()
                .filter(c -> !java.util.Objects.equals(c.getIdClase(), clase.getIdClase()))
                .filter(c -> !Boolean.TRUE.equals(c.getCancelada()))
                .anyMatch(c -> java.util.Objects.equals(c.getFecha(), clase.getFecha())
                        && java.util.Objects.equals(c.getHora(), clase.getHora()));
    }

    /**
     * Preview del abono mensual: lista las clases que le quedan al alumno en el mes
     * de la clase elegida, dentro de su misma serie (cobro proporcional). Cada ítem
     * indica si está disponible y, si no, el motivo (cancelada, llena, conflicto de
     * horario, o ya inscripto). Lo consume tanto el front (preview) como
     * PagoService al confirmar un abono.
     */
    @Transactional
    public List<AbonoPreviewDTO> previewAbono(Integer idClase, Integer idAlumno) {
        Clase claseElegida = claseRepository.findById(idClase)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        if (claseElegida.getFecha() == null) {
            return List.of();
        }

        // Ventana del abono: siempre el MES ACTUAL, desde hoy hasta fin de mes.
        // (No se ancla a la fecha de la clase clickeada, para no caer en un mes pasado.)
        LocalDate hoy = LocalDate.now();
        LocalDate fechaInicio = hoy;
        LocalDate finDeMes = hoy.withDayOfMonth(hoy.lengthOfMonth());

        // Aseguramos que existan todas las instancias del mes (materialización lazy).
        materializarRango(fechaInicio, finDeMes);

        // El abono nunca incluye clases que ya ocurrieron.
        LocalDate inicioEfectivo = fechaInicio.isBefore(hoy) ? hoy : fechaInicio;

        List<Clase> instancias;
        ClasePlantilla plantilla = claseElegida.getPlantilla();
        if (plantilla != null) {
            instancias = claseRepository.findByPlantilla_IdPlantilla(plantilla.getIdPlantilla()).stream()
                    .filter(c -> c.getFecha() != null
                            && !c.getFecha().isBefore(inicioEfectivo)
                            && !c.getFecha().isAfter(finDeMes))
                    .sorted(Comparator.comparing(Clase::getFecha))
                    .collect(Collectors.toList());
        } else {
            // Clase suelta (sin serie): el abono cubre solo esa clase si no pasó.
            if (claseElegida.getFecha() != null && claseElegida.getFecha().isBefore(hoy)) {
                instancias = List.of();
            } else {
                instancias = List.of(claseElegida);
            }
        }

        List<AbonoPreviewDTO> preview = new ArrayList<>();
        for (Clase clase : instancias) {
            // La clase de hoy que ya empezó/terminó no forma parte del abono:
            // ni aparece en la lista ni se cobra.
            if (claseYaComenzo(clase)) {
                continue;
            }

            boolean disponible = true;
            AbonoPreviewDTO.Motivo motivo = null;

            if (Boolean.TRUE.equals(clase.getCancelada())) {
                disponible = false;
                motivo = AbonoPreviewDTO.Motivo.CANCELADA;
            } else if (isAlumnoEnrolled(clase, idAlumno)) {
                disponible = false;
                motivo = AbonoPreviewDTO.Motivo.YA_INSCRIPTO;
            } else if (alumnoTieneOtraClaseEnHorario(idAlumno, clase)) {
                disponible = false;
                motivo = AbonoPreviewDTO.Motivo.CONFLICTO_HORARIO;
            } else if (claseLlenaParaAlumno(clase, idAlumno)) {
                disponible = false;
                motivo = AbonoPreviewDTO.Motivo.LLENA;
            }

            String actividad = (clase.getActividad() != null && clase.getActividad().getTipo() != null)
                    ? clase.getActividad().getTipo()
                    : "CLASE";

            double precio = (clase.getActividad() != null && clase.getActividad().getPrecio() != null)
                    ? clase.getActividad().getPrecio() : 0.0;

            preview.add(new AbonoPreviewDTO(
                    clase.getIdClase(),
                    clase.getFecha(),
                    clase.getHora() != null ? clase.getHora() : 0,
                    actividad,
                    disponible,
                    motivo,
                    precio
            ));
        }

        return preview;
    }

    /**
     * Precio del abono mensual: suma de las clases disponibles del mes con 20% off.
     * Debe coincidir con lo que muestra el popup al inscribirse.
     */
    public double calcularPrecioAbono(Integer idClase, Integer idAlumno) {
        List<AbonoPreviewDTO> preview = previewAbono(idClase, idAlumno);
        double suma = preview.stream()
                .filter(item -> item.getMotivo() == null)   // solo las disponibles, igual que el popup
                .mapToDouble(AbonoPreviewDTO::getPrecio)
                .sum();
        return Math.round(suma * 0.8);   // 20% de descuento
    }

    public List<Clase> listarClasesDeUnaFechaYHora(LocalDate fecha, int hora) {
        return claseRepository.findByFechaAndHoraAndCanceladaFalse(fecha, hora);
    }

    public List<Clase> listarClasesDeUnaActividad(Actividad actividad) {
        return claseRepository.findByActividad(actividad);
    }

    public List<Clase> listarPorIdActividad(Integer actividadId) {
        return claseRepository.findByActividad_IdActividad(actividadId);
    }

    public List<Clase> listarPorProfesorId(Integer profesorId) {
        return claseRepository.findByProfesorId(profesorId);
    }

    // Clase que el profesor está dando en este momento (fecha y hora actuales),
    // o null si no tiene ninguna clase asignada ahora.
    public ClaseActualProfesorDTO buscarClaseActualDeProfesor(Integer profesorId) {
        LocalDate hoy = LocalDate.now(BUENOS_AIRES_ZONE);
        int horaActual = LocalTime.now(BUENOS_AIRES_ZONE).getHour();

        return claseRepository.findByFechaAndHoraAndProfesor_Id(hoy, horaActual, profesorId)
                .stream()
                .filter(this::claseEnCurso)
                .findFirst()
                .map(ClaseActualProfesorDTO::fromEntity)
                .orElse(null);
    }

    private boolean claseEnCurso(Clase clase) {
        if (clase == null || clase.getFecha() == null || clase.getHora() == null) {
            return false;
        }

        if (Boolean.TRUE.equals(clase.getCancelada()) || Boolean.TRUE.equals(clase.getAsistenciaFinalizada())) {
            return false;
        }

        LocalDate hoy = LocalDate.now(BUENOS_AIRES_ZONE);
        int horaActual = LocalTime.now(BUENOS_AIRES_ZONE).getHour();

        return clase.getFecha().equals(hoy) && clase.getHora().equals(horaActual);
    }

    // HELPER
    private boolean profesorOcupado(LocalDate fecha, int hora, Integer profesorId) {
        if (profesorId == null)
            return false;
        return !claseRepository.findByFechaAndHoraAndProfesor_Id(fecha, hora, profesorId).isEmpty();
    }

    // HELPER — igual que profesorOcupado pero ignora la clase que se está
    // modificando
    private boolean profesorOcupadoExcluyendo(LocalDate fecha, int hora, Integer profesorId, int idClaseActual) {
        if (profesorId == null)
            return false;
        return claseRepository.findByFechaAndHoraAndProfesor_Id(fecha, hora, profesorId)
                .stream()
                .anyMatch(c -> c.getIdClase() != idClaseActual);
    }

    // HELPER
    private void validarActividadDelProfesor(Actividad actividad, Integer profesorId) {
        if (actividad == null || actividad.getIdActividad() == null) {
            throw new RuntimeException("La actividad de la clase es obligatoria.");
        }
        if (profesorId == null) {
            throw new RuntimeException("El profesor de la clase es obligatorio.");
        }

        Profesor profesor = profesorRepository.findById(profesorId)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado."));

        if (profesor.getActividad() == null
                || !profesor.getActividad().getIdActividad().equals(actividad.getIdActividad())) {
            throw new RuntimeException("El profesor seleccionado no dicta esta actividad.");
        }
    }

    // HELPER
    private void validarDiaHabil(LocalDate fecha) {
        DayOfWeek dia = fecha.getDayOfWeek();
        if (dia == DayOfWeek.SATURDAY || dia == DayOfWeek.SUNDAY) {
            throw new RuntimeException(
                    "El gimnasio no opera los fines de semana. Las clases solo pueden programarse de lunes a viernes.");
        }
    }

    // HELPER
    private void validarFechaHoraFutura(LocalDate fecha, int hora) {
        LocalDateTime fechaHora = fecha.atTime(hora, 0);
        if (!fechaHora.isAfter(LocalDateTime.now())) {
            throw new RuntimeException("No se puede programar una clase en una fecha y hora que ya pasaron.");
        }
    }

    // HELPER
    private boolean horaDisponible(LocalDate fecha, int hora) {
        return this.listarClasesDeUnaFechaYHora(fecha, hora).size() < 3;
    }

    // HELPER
    private boolean tieneAlumnosInscriptos(Clase clase) {
        ListaAsistencia listaAsistencia = clase.getListaAsistencia();

        return listaAsistencia != null
                && listaAsistencia.getAlumnos() != null
                && !listaAsistencia.getAlumnos().isEmpty();
    }

    // HELPER
    private boolean cupoDisponibleEnTurno(List<Clase> listaClases, int cupoClase) {
        return listaClases.stream()
                .mapToInt(Clase::getCupo)
                .sum() + cupoClase <= 30;
    }

    // HELPER
    private List<Clase> listarClasesDelTurnoExcluyendoClaseActual(
            LocalDate fecha,
            int hora,
            int idClaseActual) {
        return claseRepository.findByFechaAndHoraAndCanceladaFalse(fecha, hora)
                .stream()
                .filter(clase -> clase.getIdClase() != idClaseActual)
                .toList();
    }

    // HELPER
    private boolean mismaDisciplinaEnElTurno(List<Clase> listaClases, Actividad actividad) {
        if (actividad == null || actividad.getIdActividad() == null) {
            return false;
        }

        Integer idActividadNueva = actividad.getIdActividad();

        return listaClases.stream()
                .filter(clase -> clase.getActividad() != null)
                .filter(clase -> clase.getActividad().getIdActividad() != null)
                .anyMatch(clase -> clase.getActividad().getIdActividad().equals(idActividadNueva));
    }

    // 2. AGREGAR / GUARDAR
    public Clase crearClase(Clase clase) {
        validarDiaHabil(clase.getFecha());
        validarFechaHoraFutura(clase.getFecha(), clase.getHora());

        if (clase.getCancelada() == null) {
            clase.setCancelada(false);
        }

        if (clase.getPrecio() == null || clase.getPrecio() == 0.0) {
            if (clase.getActividad() != null && clase.getActividad().getIdActividad() != null) {
                Actividad act = actividadRepository.findById(clase.getActividad().getIdActividad()).orElse(null);
                if (act != null && act.getPrecio() != null) {
                    clase.setPrecio(act.getPrecio());
                } else {
                    clase.setPrecio(0.0);
                }
            } else {
                clase.setPrecio(0.0);
            }
        }

        List<Clase> clasesFechaYHoraSolicitadas = this.listarClasesDeUnaFechaYHora(clase.getFecha(), clase.getHora());

        Integer profesorId = clase.getProfesor() != null ? clase.getProfesor().getId() : null;
        validarActividadDelProfesor(clase.getActividad(), profesorId);

        // El conflicto de disciplina se evalúa primero: cubre los casos de "3 clases en
        // el turno"
        // y "profesor ocupado", ya que esos siempre desembocan en una clase de la misma
        // actividad.
        if (this.mismaDisciplinaEnElTurno(clasesFechaYHoraSolicitadas, clase.getActividad())) {
            throw new RuntimeException(
                    "Lo sentimos, no ha sido posible registrar la clase, ya que en ese turno se encuentra registrada la misma disciplina");
        }

        if (!this.horaDisponible(clase.getFecha(), clase.getHora())) {
            throw new RuntimeException(
                    "Lo sentimos, el horario ingresado ya tiene 3 clases asignadas. Por favor, pruebe con un horario distinto");
        }

        if (this.profesorOcupado(clase.getFecha(), clase.getHora(), profesorId)) {
            throw new RuntimeException("El profesor seleccionado ya tiene una clase asignada en ese horario.");
        }

        if (!this.cupoDisponibleEnTurno(clasesFechaYHoraSolicitadas, clase.getCupo())) {
            throw new RuntimeException(
                    "Lo sentimos, no ha sido posible registrar la clase ya que el cupo máximo de 30 personas ha sido superado, por favor inténtelo de nuevo.");
        }

        return claseRepository.save(clase);
    }

    // 3. BUSCAR POR ID
    public Clase buscarPorId(Integer id) {
        return claseRepository.findById(id).orElseThrow(() -> new RuntimeException("Clase no encontrada"));
    }

    // Alumnos anotados en una clase puntual, con si faltaron o no a esa clase
    // puntual (null si todavía no se le pasó asistencia).
    public List<AlumnoAsistenciaDTO> listarAlumnosDeClase(Integer idClase) {
        Clase clase = claseRepository.findById(idClase)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        if (clase.getListaAsistencia() == null || clase.getListaAsistencia().getAlumnos() == null) {
            return List.of();
        }

        Map<Integer, Boolean> faltoPorAlumno = registroAsistenciaRepository.findByClase_IdClase(idClase).stream()
                .collect(Collectors.toMap(r -> r.getAlumno().getId(), RegistroAsistencia::getFalto, (existente, duplicado) -> existente));

        // El join (lista_asistencia_alumnos) puede tener filas duplicadas para un
        // mismo alumno; se deduplica por id antes de mapear a DTO.
        return clase.getListaAsistencia().getAlumnos().stream()
                .collect(Collectors.toMap(Alumno::getId, a -> a, (existente, duplicado) -> existente,
                        LinkedHashMap::new))
                .values()
                .stream()
                .map(alumno -> AlumnoAsistenciaDTO.fromEntity(alumno, faltoPorAlumno.get(alumno.getId())))
                .toList();
    }

    // Marca a un alumno como presente en una clase a partir de su QR escaneado.
    // Valida que exista, esté activo y esté anotado en esa clase puntual.
    @Transactional
    public AlumnoResumenDTO registrarAsistenciaPorEscaneo(Integer idClase, Integer idAlumno) {
        Clase clase = claseRepository.findById(idClase)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        if (!claseEnCurso(clase)) {
            throw new RuntimeException("La clase no se encuentra en curso.");
        }

        Alumno alumno = alumnoRepository.findById(idAlumno)
                .orElseThrow(() -> new RuntimeException("El código no corresponde a ningún alumno."));

        if (!alumno.isActivo()) {
            throw new RuntimeException("El alumno no se encuentra activo.");
        }

        boolean inscripto = clase.getListaAsistencia() != null
                && clase.getListaAsistencia().getAlumnos() != null
                && clase.getListaAsistencia().getAlumnos().stream()
                        .anyMatch(a -> a.getId().equals(idAlumno));

        if (!inscripto) {
            throw new RuntimeException("Este alumno no está anotado en esta clase.");
        }

        RegistroAsistencia registro = registroAsistenciaRepository
                .findByAlumno_IdAndClase_IdClase(idAlumno, idClase)
                .orElseGet(() -> {
                    RegistroAsistencia nuevo = new RegistroAsistencia();
                    nuevo.setAlumno(alumno);
                    nuevo.setClase(clase);
                    return nuevo;
                });

        registro.setFalto(false);
        registroAsistenciaRepository.save(registro);

        return AlumnoResumenDTO.fromEntity(alumno);
    }

    // Corre periódicamente: para cada clase ya terminada (cancelada=false)
    // que todavía no tiene su asistencia finalizada, marca falto=true a los
    // alumnos anotados que nadie escaneó y les suma una falta.
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void finalizarAsistenciasDeClasesTerminadas() {
        LocalDateTime ahora = LocalDateTime.now(BUENOS_AIRES_ZONE);

        for (Clase clase : claseRepository.findPendientesDeFinalizarAsistencia()) {
            if (clase.getFecha() == null || clase.getHora() == null) {
                continue;
            }

            LocalDateTime finDeClase = clase.getFecha().atTime(clase.getHora() + 1, 0);
            if (finDeClase.isAfter(ahora)) {
                continue;
            }

            marcarAusentesSinEscanear(clase);
            clase.setAsistenciaFinalizada(true);
            claseRepository.save(clase);
        }
    }

    // Corre todos los días a las 00:05: garantiza que, para el MES ACTUAL, cada
    // alumno que tuvo un abono COMPLETADO de una serie el MES ANTERIOR tenga su
    // reserva de cupo (prioridad de renovación). Es idempotente: si la reserva
    // ya existe no la duplica, así que correrlo a diario es seguro y cubre el
    // arranque de cada mes. Ver ReservaCupo.
    @Scheduled(cron = "0 5 0 * * *", zone = "America/Argentina/Buenos_Aires")
    @Transactional
    public void generarReservasDeRenovacion() {
        LocalDate hoy = LocalDate.now(BUENOS_AIRES_ZONE);
        YearMonth mesActual = YearMonth.from(hoy);
        YearMonth mesAnterior = mesActual.minusMonths(1);

        // Aseguramos que existan las clases del mes actual: las reservas guardan
        // el cupo de esas instancias.
        materializarRango(hoy.withDayOfMonth(1), hoy.withDayOfMonth(hoy.lengthOfMonth()));

        List<Pago> abonos = pagoRepository.findByEstadoAndTipo(
                Pago.EstadoPago.COMPLETADO, Pago.TipoClase.ABONADO);

        for (Pago pago : abonos) {
            Clase clase = pago.getClase();
            Alumno alumno = pago.getAlumno();
            if (clase == null || alumno == null
                    || clase.getPlantilla() == null || clase.getFecha() == null) {
                continue;
            }
            // Solo abonos del mes anterior.
            if (!YearMonth.from(clase.getFecha()).equals(mesAnterior)) {
                continue;
            }

            ClasePlantilla plantilla = clase.getPlantilla();
            boolean yaExiste = reservaCupoRepository
                    .existsByAlumno_IdAndPlantilla_IdPlantillaAndAnioAndMes(
                            alumno.getId(), plantilla.getIdPlantilla(),
                            mesActual.getYear(), mesActual.getMonthValue());
            if (yaExiste) {
                continue;
            }

            ReservaCupo reserva = new ReservaCupo();
            reserva.setAlumno(alumno);
            reserva.setPlantilla(plantilla);
            reserva.setAnio(mesActual.getYear());
            reserva.setMes(mesActual.getMonthValue());
            reserva.setEstado(ReservaCupo.EstadoReserva.PENDIENTE);
            reservaCupoRepository.save(reserva);
        }
    }

    // HELPER — a cada alumno anotado en la clase que todavía no tiene un
    // registro de asistencia, se le crea uno con falto=true y se le suma
    // una falta.
    private void marcarAusentesSinEscanear(Clase clase) {
        if (clase.getListaAsistencia() == null || clase.getListaAsistencia().getAlumnos() == null) {
            return;
        }

        Set<Integer> yaRegistrados = registroAsistenciaRepository.findByClase_IdClase(clase.getIdClase()).stream()
                .map(r -> r.getAlumno().getId())
                .collect(Collectors.toSet());

        clase.getListaAsistencia().getAlumnos().stream()
                .collect(Collectors.toMap(Alumno::getId, a -> a, (existente, duplicado) -> existente, LinkedHashMap::new))
                .values()
                .stream()
                .filter(alumno -> !yaRegistrados.contains(alumno.getId()))
                .forEach(alumno -> {
                    RegistroAsistencia registroAusente = new RegistroAsistencia();
                    registroAusente.setAlumno(alumno);
                    registroAusente.setClase(clase);
                    registroAusente.setFalto(true);
                    registroAsistenciaRepository.save(registroAusente);

                    int faltadasActuales = alumno.getClasesFaltadas() == null ? 0 : alumno.getClasesFaltadas();
                    alumno.setClasesFaltadas(faltadasActuales + 1);
                    alumnoRepository.save(alumno);
                });
    }

    // 4. ELIMINAR
    public void eliminar(Integer id) {
        claseRepository.deleteById(id);
    }

    // 5. MODIFICAR CLASE
    @Transactional
    public Clase modificarClase(Clase claseActualizada, Integer id) {
        Clase claseExistente = claseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        LocalDate nuevaFechaParaValidar = claseActualizada.getFecha() != null
                ? claseActualizada.getFecha()
                : claseExistente.getFecha();
        validarDiaHabil(nuevaFechaParaValidar);

        if (tieneAlumnosInscriptos(claseExistente)) {
            throw new RuntimeException(
                    "La modificación no se ha podido realizar ya que hay alumnos inscriptos en la clase");
        }

        LocalDate nuevaFecha = claseActualizada.getFecha() != null
                ? claseActualizada.getFecha()
                : claseExistente.getFecha();

        int nuevaHora = claseActualizada.getHora() != null && claseActualizada.getHora() != 0
                ? claseActualizada.getHora()
                : claseExistente.getHora();

        validarFechaHoraFutura(nuevaFecha, nuevaHora);

        int nuevoCupo = claseActualizada.getCupo() != null && claseActualizada.getCupo() != 0
                ? claseActualizada.getCupo()
                : claseExistente.getCupo();

        Actividad actividadAValidar = claseActualizada.getActividad() != null
                ? claseActualizada.getActividad()
                : claseExistente.getActividad();

        List<Clase> clasesDelTurnoSinLaActual = listarClasesDelTurnoExcluyendoClaseActual(nuevaFecha, nuevaHora, id);

        Integer profesorIdNuevo = claseActualizada.getProfesor() != null
                ? claseActualizada.getProfesor().getId()
                : claseExistente.getProfesor() != null ? claseExistente.getProfesor().getId() : null;

        validarActividadDelProfesor(actividadAValidar, profesorIdNuevo);

        // El conflicto de disciplina se evalúa primero: cubre los casos de "3 clases en
        // el turno"
        // y "profesor ocupado", ya que esos siempre desembocan en una clase de la misma
        // actividad.
        if (mismaDisciplinaEnElTurno(clasesDelTurnoSinLaActual, actividadAValidar)) {
            throw new RuntimeException(
                    "La modificación no es posible ya que hay una clase de la misma disciplina en el turno seleccionado.");
        }

        if (clasesDelTurnoSinLaActual.size() >= 3) {
            throw new RuntimeException("La modificación no es posible ya que ese turno se encuentra ocupado");
        }

        if (this.profesorOcupadoExcluyendo(nuevaFecha, nuevaHora, profesorIdNuevo, id)) {
            throw new RuntimeException("El profesor seleccionado ya tiene una clase asignada en ese horario.");
        }

        if (!cupoDisponibleEnTurno(clasesDelTurnoSinLaActual, nuevoCupo)) {
            throw new RuntimeException(
                    "La modificación no es posible ya que el cupo en el mismo turno excede la capacidad del gimnasio");
        }

        claseExistente.setFecha(nuevaFecha);
        claseExistente.setHora(nuevaHora);
        claseExistente.setCupo(nuevoCupo);

        if (claseActualizada.getProfesor() != null) {
            claseExistente.setProfesor(claseActualizada.getProfesor());
        }

        return claseRepository.save(claseExistente);
    }

    @Transactional
    public Clase cancelarClase(Integer id, String motivo) {
        Clase claseExistente = claseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        if (Boolean.TRUE.equals(claseExistente.getCancelada())) {
            throw new RuntimeException("La clase ya se encuentra cancelada");
        }

        boolean hayInscriptos = contarAlumnosInscriptos(claseExistente) > 0;
        boolean motivoVacio = motivo == null || motivo.trim().isEmpty();

        // Con alumnos inscriptos el motivo es obligatorio: hay que avisarles
        // por qué se cancela la clase (se les comunica por mail).
        if (hayInscriptos && motivoVacio) {
            throw new RuntimeException(
                    "Debe indicar el motivo de la cancelación ya que hay alumnos inscriptos en la clase");
        }

        ListaAsistencia listaAsistencia = claseExistente.getListaAsistencia();
        if (hayInscriptos) {
            String descripcionClase = descripcionDeClase(claseExistente);
            // Deduplicar por id: si la lista tuviera al mismo alumno repetido,
            // igual recibe UN crédito y UN mail (mismo patrón que el scheduler
            // de asistencias).
            java.util.Collection<Alumno> alumnosUnicos = listaAsistencia.getAlumnos().stream()
                    .collect(Collectors.toMap(Alumno::getId, a -> a, (existente, duplicado) -> existente, LinkedHashMap::new))
                    .values();

            alumnosUnicos.forEach(alumno -> {
                Integer creditosActuales = alumno.getCreditos() == null ? 0 : alumno.getCreditos();
                alumno.setCreditos(creditosActuales + 1);
                emailService.notificarClaseCancelada(
                        alumno.getEmail(), alumno.getNombre(), descripcionClase, motivo.trim());
            });

            alumnoRepository.saveAll(new ArrayList<>(alumnosUnicos));
        }

        claseExistente.setCancelada(true);
        claseExistente.setMotivoCancelacion(motivoVacio ? null : motivo.trim());
        return claseRepository.save(claseExistente);
    }

    // HELPER — descripción legible de la clase para los avisos por mail.
    private String descripcionDeClase(Clase clase) {
        String actividad = (clase.getActividad() != null && clase.getActividad().getTipo() != null)
                ? clase.getActividad().getTipo()
                : "Clase";
        String hora = clase.getHora() != null ? clase.getHora() + ":00 hs" : "";
        return (actividad + " del " + clase.getFecha() + " " + hora).trim();
    }

    // Cancela una clase individual y reporta a cuántos alumnos se les
    // acreditó un crédito (para mostrarlo en el panel administrativo).
    @Transactional
    public ClaseCancelacionResponse cancelarClaseConDetalle(Integer id, String motivo) {
        Clase clase = claseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        if (Boolean.TRUE.equals(clase.getCancelada())) {
            throw new RuntimeException("La clase ya se encuentra cancelada");
        }

        int alumnosAcreditados = contarAlumnosInscriptos(clase);
        cancelarClase(id, motivo);

        return new ClaseCancelacionResponse(1, 1, alumnosAcreditados);
    }

    // HELPER — cuántos alumnos tiene anotados una clase (se consulta antes de
    // cancelarla para poder reportar a cuántos se les acreditó un crédito).
    private int contarAlumnosInscriptos(Clase clase) {
        ListaAsistencia listaAsistencia = clase.getListaAsistencia();
        return listaAsistencia != null && listaAsistencia.getAlumnos() != null
                ? listaAsistencia.getAlumnos().size()
                : 0;
    }

    // HELPER — cancela (idempotente sobre las ya canceladas) una lista de
    // instancias reusando cancelarClase, que ya maneja el reembolso de créditos,
    // la exigencia de motivo cuando hay inscriptos y el aviso por mail.
    private ClaseCancelacionResponse cancelarInstancias(List<Clase> instancias, String motivo) {
        int canceladas = 0;
        int alumnosAcreditados = 0;

        for (Clase clase : instancias) {
            if (Boolean.TRUE.equals(clase.getCancelada())) {
                continue;
            }
            alumnosAcreditados += contarAlumnosInscriptos(clase);
            cancelarClase(clase.getIdClase(), motivo);
            canceladas++;
        }

        return new ClaseCancelacionResponse(canceladas, 0, alumnosAcreditados);
    }

    // Cancela todas las instancias de una serie dentro de un rango de fechas,
    // materializando primero las que falten para que el rango quede completo.
    @Transactional
    public ClaseCancelacionResponse cancelarRangoSerie(Integer idPlantilla, CancelarRangoRequest request) {
        LocalDate desde = request.getDesde();
        LocalDate hasta = request.getHasta();

        if (desde == null || hasta == null || hasta.isBefore(desde)) {
            throw new RuntimeException("Debe indicar un rango de fechas válido.");
        }

        clasePlantillaRepository.findById(idPlantilla)
                .orElseThrow(() -> new RuntimeException("La serie seleccionada no existe."));

        materializarRango(desde, hasta);

        List<Clase> instancias = claseRepository.findByPlantilla_IdPlantilla(idPlantilla).stream()
                .filter(c -> c.getFecha() != null && !c.getFecha().isBefore(desde) && !c.getFecha().isAfter(hasta))
                .toList();

        ClaseCancelacionResponse resultado = cancelarInstancias(instancias, request.getMotivo());
        resultado.setTotalEnRango(instancias.size());
        return resultado;
    }

    // Corta la vigencia de una serie a partir de una fecha (no se generan más
    // instancias desde ahí) y cancela las instancias ya materializadas en o
    // después de esa fecha.
    @Transactional
    public ClaseCancelacionResponse cancelarDesdeSerie(Integer idPlantilla, CancelarDesdeRequest request) {
        LocalDate desde = request.getDesde();

        if (desde == null) {
            throw new RuntimeException("Debe indicar una fecha válida.");
        }

        ClasePlantilla plantilla = clasePlantillaRepository.findById(idPlantilla)
                .orElseThrow(() -> new RuntimeException("La serie seleccionada no existe."));

        plantilla.setVigenciaHasta(desde.minusDays(1));
        clasePlantillaRepository.save(plantilla);

        List<Clase> instanciasFuturas = claseRepository.findByPlantilla_IdPlantilla(idPlantilla).stream()
                .filter(c -> c.getFecha() != null && !c.getFecha().isBefore(desde))
                .toList();

        ClaseCancelacionResponse resultado = cancelarInstancias(instanciasFuturas, request.getMotivo());
        resultado.setTotalEnRango(instanciasFuturas.size());
        return resultado;
    }

    // ============================================================
    // SERIES PERPETUAS (ClasePlantilla) + INSTANCIAS (Clase)
    // ============================================================

    private static final java.util.Map<String, DayOfWeek> DIAS = java.util.Map.of(
            "monday", DayOfWeek.MONDAY,
            "tuesday", DayOfWeek.TUESDAY,
            "wednesday", DayOfWeek.WEDNESDAY,
            "thursday", DayOfWeek.THURSDAY,
            "friday", DayOfWeek.FRIDAY);

    // HELPER — genera las fechas semanales desde la próxima ocurrencia del día
    // elegido hasta dentro de 2 meses (misma ventana que usaba el front).
    private List<LocalDate> generarFechasSerie(DayOfWeek dia, int hora) {
        LocalDate hoy = LocalDate.now(BUENOS_AIRES_ZONE);
        int diff = (dia.getValue() - hoy.getDayOfWeek().getValue() + 7) % 7;
        LocalDate inicio = hoy.plusDays(diff);

        // Si la primera ocurrencia es hoy pero la hora ya pasó, arrancamos la próxima
        // semana.
        if (diff == 0 && hora <= LocalTime.now(BUENOS_AIRES_ZONE).getHour()) {
            inicio = inicio.plusWeeks(1);
        }

        LocalDate fin = hoy.plusMonths(2);
        List<LocalDate> fechas = new ArrayList<>();
        for (LocalDate f = inicio; !f.isAfter(fin); f = f.plusWeeks(1)) {
            fechas.add(f);
        }
        return fechas;
    }

    // HELPER — true si dos rangos de vigencia [desde, hasta] se superponen.
    // hasta == null significa "sin fecha de fin" (vigencia perpetua).
    private boolean seSuperponenVigencias(LocalDate desdeA, LocalDate hastaA, LocalDate desdeB, LocalDate hastaB) {
        boolean aEmpiezaAntesDeQueTermineB = hastaB == null || !desdeA.isAfter(hastaB);
        boolean bEmpiezaAntesDeQueTermineA = hastaA == null || !desdeB.isAfter(hastaA);
        return aEmpiezaAntesDeQueTermineB && bEmpiezaAntesDeQueTermineA;
    }

    // HELPER — plantillas activas en el mismo día y hora cuya vigencia se superpone
    // con la de la plantilla que se quiere crear.
    private List<ClasePlantilla> plantillasSuperpuestasEnElTurno(
            DayOfWeek dia,
            int hora,
            LocalDate vigenciaDesdeNueva,
            LocalDate vigenciaHastaNueva) {
        return clasePlantillaRepository.findByDiaSemanaAndHoraAndActivaTrue(dia, hora)
                .stream()
                .filter(p -> seSuperponenVigencias(
                        p.getVigenciaDesde(), p.getVigenciaHasta(),
                        vigenciaDesdeNueva, vigenciaHastaNueva))
                .toList();
    }

    // HELPER — análogo a mismaDisciplinaEnElTurno, pero evaluado contra plantillas.
    private boolean mismaDisciplinaEnElTurnoPlantilla(List<ClasePlantilla> plantillasSuperpuestas,
            Actividad actividad) {
        if (actividad == null || actividad.getIdActividad() == null) {
            return false;
        }

        Integer idActividadNueva = actividad.getIdActividad();

        return plantillasSuperpuestas.stream()
                .filter(p -> p.getActividad() != null)
                .filter(p -> p.getActividad().getIdActividad() != null)
                .anyMatch(p -> p.getActividad().getIdActividad().equals(idActividadNueva));
    }

    // HELPER — análogo a horaDisponible, pero evaluado contra plantillas.
    private boolean turnoDisponiblePlantilla(List<ClasePlantilla> plantillasSuperpuestas) {
        return plantillasSuperpuestas.size() < 3;
    }

    // HELPER — análogo a profesorOcupado, pero evaluado contra plantillas.
    private boolean profesorOcupadoPlantilla(List<ClasePlantilla> plantillasSuperpuestas, Integer profesorId) {
        if (profesorId == null)
            return false;
        return plantillasSuperpuestas.stream()
                .anyMatch(p -> p.getProfesor() != null && profesorId.equals(p.getProfesor().getId()));
    }

    // HELPER — análogo a cupoDisponibleEnTurno, pero evaluado contra plantillas.
    private boolean cupoDisponibleEnTurnoPlantilla(List<ClasePlantilla> plantillasSuperpuestas, int cupoNuevo) {
        int cupoExistente = plantillasSuperpuestas.stream()
                .mapToInt(p -> p.getCupo() == null ? 0 : p.getCupo())
                .sum();
        return cupoExistente + cupoNuevo <= 30;
    }

    /**
     * Materialización lazy: crea en la BD las instancias (Clase) que falten para
     * cada plantilla activa dentro del rango pedido. Es idempotente — saltea las
     * fechas que ya tienen instancia (incluidas las canceladas), así que es seguro
     * llamarlo en cada GET de calendario.
     *
     * No re-corre las validaciones de turno: la plantilla ya es una serie
     * aprobada, y validar durante una lectura podría romper el GET.
     */
    @Transactional
    public void materializarRango(LocalDate desde, LocalDate hasta) {
        if (desde == null || hasta == null || hasta.isBefore(desde)) {
            return;
        }

        // Tope de seguridad: nunca materializar más de un año de una sola vez.
        if (hasta.isAfter(desde.plusYears(1))) {
            hasta = desde.plusYears(1);
        }

        for (ClasePlantilla plantilla : clasePlantillaRepository.findAll()) {
            if (!Boolean.TRUE.equals(plantilla.getActiva())) {
                continue;
            }

            Set<LocalDate> fechasExistentes = claseRepository
                    .findByPlantilla_IdPlantilla(plantilla.getIdPlantilla())
                    .stream()
                    .map(Clase::getFecha)
                    .collect(Collectors.toCollection(HashSet::new));

            for (LocalDate fecha = desde; !fecha.isAfter(hasta); fecha = fecha.plusDays(1)) {
                if (fecha.getDayOfWeek() != plantilla.getDiaSemana()) {
                    continue;
                }
                if (plantilla.getVigenciaDesde() != null && fecha.isBefore(plantilla.getVigenciaDesde())) {
                    continue;
                }
                if (plantilla.getVigenciaHasta() != null && fecha.isAfter(plantilla.getVigenciaHasta())) {
                    continue;
                }
                if (fechasExistentes.contains(fecha)) {
                    continue;
                }

                Clase clase = new Clase();
                clase.setPlantilla(plantilla);
                clase.setFecha(fecha);
                clase.setHora(plantilla.getHora());
                clase.setCupo(plantilla.getCupo());
                double precioActividad = (plantilla.getActividad() != null && plantilla.getActividad().getPrecio() != null && plantilla.getActividad().getPrecio() > 0)
                        ? plantilla.getActividad().getPrecio() : plantilla.getPrecio();
                clase.setPrecio(precioActividad);
                clase.setActividad(plantilla.getActividad());
                clase.setProfesor(plantilla.getProfesor());
                clase.setCancelada(false);
                claseRepository.save(clase);

                fechasExistentes.add(fecha);
            }
        }
    }

    @Transactional
    public ClaseSerieResponse crearSerie(ClasePlantillaRequest request) {
        if (request.getDia() == null || !DIAS.containsKey(request.getDia())) {
            throw new RuntimeException("Debe seleccionar un día de la semana válido (lunes a viernes).");
        }
        if (request.getHora() == null) {
            throw new RuntimeException("Debe seleccionar una hora válida.");
        }
        if (request.getCupo() == null || request.getCupo() <= 0 || request.getCupo() > 30) {
            throw new RuntimeException("Debe ingresar un cupo válido entre 1 y 30.");
        }
        if (request.getActividadId() == null || request.getActividadId() <= 0) {
            throw new RuntimeException("Debe seleccionar una actividad válida.");
        }
        if (request.getProfesorId() == null || request.getProfesorId() <= 0) {
            throw new RuntimeException("Debe seleccionar un profesor válido.");
        }

        DayOfWeek dia = DIAS.get(request.getDia());
        int hora = request.getHora();

        Profesor profesor = profesorRepository.findById(request.getProfesorId())
                .orElseThrow(() -> new RuntimeException("El profesor seleccionado no existe."));

        Actividad actividad = actividadRepository.findById(request.getActividadId())
                .orElseThrow(() -> new RuntimeException("La actividad seleccionada no existe."));

        double precio = request.getPrecio() != null ? request.getPrecio() : (actividad.getPrecio() != null ? actividad.getPrecio() : 0.0);

        List<LocalDate> fechas = generarFechasSerie(dia, hora);
        if (fechas.isEmpty()) {
            throw new RuntimeException("No hay fechas disponibles en los próximos dos meses para ese día.");
        }

        LocalDate vigenciaDesde = fechas.get(0);
        List<ClasePlantilla> plantillasSuperpuestas = plantillasSuperpuestasEnElTurno(dia, hora, vigenciaDesde, null);

        // Mismo orden que las validaciones de turno para una Clase concreta:
        // disciplina repetida primero, luego cupo de turno, profesor y cupo total.
        if (mismaDisciplinaEnElTurnoPlantilla(plantillasSuperpuestas, actividad)) {
            throw new RuntimeException("Ya existe una serie de la misma disciplina en ese día y horario.");
        }

        if (!turnoDisponiblePlantilla(plantillasSuperpuestas)) {
            throw new RuntimeException(
                    "Ese día y horario ya tiene 3 series asignadas. Por favor, pruebe con un horario distinto.");
        }

        if (profesorOcupadoPlantilla(plantillasSuperpuestas, profesor.getId())) {
            throw new RuntimeException("El profesor seleccionado ya tiene una serie asignada en ese día y horario.");
        }

        if (!cupoDisponibleEnTurnoPlantilla(plantillasSuperpuestas, request.getCupo())) {
            throw new RuntimeException("El cupo total de las series en ese turno superaría el máximo de 30 personas.");
        }

        ClasePlantilla plantilla = new ClasePlantilla();
        plantilla.setActividad(actividad);
        plantilla.setProfesor(profesor);
        plantilla.setDiaSemana(dia);
        plantilla.setHora(hora);
        plantilla.setCupo(request.getCupo());
        plantilla.setPrecio(precio);
        plantilla.setActiva(true);
        plantilla.setVigenciaDesde(vigenciaDesde);
        plantilla.setVigenciaHasta(null);
        ClasePlantilla plantillaGuardada = clasePlantillaRepository.save(plantilla);

        int creadas = 0;
        List<String> errores = new ArrayList<>();

        for (LocalDate fecha : fechas) {
            Clase clase = new Clase();
            clase.setPlantilla(plantillaGuardada);
            clase.setFecha(fecha);
            clase.setHora(hora);
            clase.setCupo(request.getCupo());
            clase.setPrecio(precio);
            clase.setActividad(actividad);
            clase.setProfesor(profesor);
            clase.setCancelada(false);

            try {
                crearClase(clase);
                creadas++;
            } catch (RuntimeException e) {
                errores.add(fecha + ": " + e.getMessage());
            }
        }

        if (creadas == 0) {
            // Nada pudo crearse: revertimos también la plantilla.
            throw new RuntimeException(errores.isEmpty()
                    ? "No se pudo crear ninguna clase de la serie."
                    : errores.get(0));
        }

        return new ClaseSerieResponse(
                plantillaGuardada.getIdPlantilla(),
                creadas,
                errores.size(),
                errores);
    }

    // HELPER — true si el profesor está de licencia (no disponible) en esa fecha.
    private boolean profesorEnLicencia(Integer profesorId, LocalDate fecha) {
        if (profesorId == null || fecha == null) {
            return false;
        }
        return licenciaProfesorRepository.findByProfesor_Id(profesorId).stream()
                .anyMatch(l -> l.getDesde() != null && l.getHasta() != null
                        && !fecha.isBefore(l.getDesde())
                        && !fecha.isAfter(l.getHasta()));
    }

    // HELPER — true si el profesor está disponible para dar clase en esa
    // fecha/hora:
    // ni de licencia, ni ya dictando otra clase en ese mismo turno.
    private boolean profesorDisponible(Integer profesorId, LocalDate fecha, int hora, int idClaseExcluir) {
        if (profesorEnLicencia(profesorId, fecha)) {
            return false;
        }
        return !profesorOcupadoExcluyendo(fecha, hora, profesorId, idClaseExcluir);
    }

    // HELPER — true si la clase todavía no se impartió (fecha y hora futuras).
    private boolean claseAunNoImpartida(Clase clase) {
        if (clase.getFecha() == null) {
            return false;
        }
        int hora = clase.getHora() != null ? clase.getHora() : 0;
        return clase.getFecha().atTime(hora, 0).isAfter(LocalDateTime.now());
    }

    @Transactional
    public ClaseCalendarioDTO cambiarProfesor(Integer idClase, CambiarProfesorRequest request) {
        if (request.getProfesorId() == null || request.getProfesorId() <= 0) {
            throw new RuntimeException("Debe seleccionar un profesor válido.");
        }

        Clase clase = claseRepository.findById(idClase)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        Profesor profesor = profesorRepository.findById(request.getProfesorId())
                .orElseThrow(() -> new RuntimeException("El profesor seleccionado no existe."));

        // El profesor debe dictar la disciplina de la clase.
        validarActividadDelProfesor(clase.getActividad(), profesor.getId());

        String alcance = request.getAlcance() == null ? "INDIVIDUAL" : request.getAlcance().toUpperCase();

        if ("SERIE".equals(alcance)) {
            ClasePlantilla plantilla = clase.getPlantilla();
            if (plantilla == null) {
                throw new RuntimeException(
                        "Esta clase no pertenece a una serie, no se puede cambiar el profesor de toda la serie.");
            }

            // Materializamos los próximos 2 meses para tener el período concreto de clases
            // futuras.
            LocalDate hoy = LocalDate.now(BUENOS_AIRES_ZONE);
            materializarRango(hoy, hoy.plusMonths(2));

            // Todas las clases de la serie aún no impartidas (futuras, no canceladas).
            List<Clase> futuras = claseRepository.findByPlantilla_IdPlantilla(plantilla.getIdPlantilla()).stream()
                    .filter(c -> !Boolean.TRUE.equals(c.getCancelada()))
                    .filter(this::claseAunNoImpartida)
                    .collect(Collectors.toList());

            // El profesor debe estar disponible en TODO el período; si falla en alguna, no
            // se cambia nada.
            boolean noDisponibleEnAlguna = futuras.stream()
                    .anyMatch(c -> !profesorDisponible(profesor.getId(), c.getFecha(), c.getHora(), c.getIdClase()));
            if (noDisponibleEnAlguna) {
                throw new RuntimeException(
                        "El cambio de profesor no pudo realizarse debido a que el profesor seleccionado no se encuentra disponible para todo o una parte del período seleccionado.");
            }

            plantilla.setProfesor(profesor);
            clasePlantillaRepository.save(plantilla);

            futuras.forEach(c -> c.setProfesor(profesor));
            claseRepository.saveAll(futuras);
            return ClaseCalendarioDTO.fromEntity(clase);
        }

        // INDIVIDUAL — solo esta clase.
        if (!profesorDisponible(profesor.getId(), clase.getFecha(), clase.getHora(), clase.getIdClase())) {
            throw new RuntimeException(
                    "El cambio de profesor no pudo realizarse debido a que el profesor seleccionado no se encuentra disponible para dar clases en el día y horario seleccionados.");
        }

        clase.setProfesor(profesor);
        return ClaseCalendarioDTO.fromEntity(claseRepository.save(clase));
    }

}