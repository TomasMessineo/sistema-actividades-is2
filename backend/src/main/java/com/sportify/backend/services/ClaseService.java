package com.sportify.backend.services;

import com.sportify.backend.dtos.AbonoPreviewDTO;
import com.sportify.backend.dtos.CambiarProfesorRequest;
import com.sportify.backend.dtos.ClaseCalendarioDTO;
import com.sportify.backend.dtos.ClasePlantillaRequest;
import com.sportify.backend.dtos.ClaseSerieResponse;
import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.ClasePlantilla;
import com.sportify.backend.entities.LicenciaProfesor;
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.entities.Profesor;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.ClasePlantillaRepository;
import com.sportify.backend.repositories.ClaseRepository;
import com.sportify.backend.repositories.LicenciaProfesorRepository;
import com.sportify.backend.repositories.ProfesorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class ClaseService {

    @Autowired
    private ClaseRepository claseRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private ClasePlantillaRepository clasePlantillaRepository;

    @Autowired
    private ProfesorRepository profesorRepository;

    @Autowired
    private LicenciaProfesorRepository licenciaProfesorRepository;

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
        if (alumnoId == null) {
            return listAll().stream()
                    .filter(clase -> !Boolean.TRUE.equals(clase.getCancelada()))
                    .collect(Collectors.toList());
        }

        return listAll().stream()
                .filter(clase -> !Boolean.TRUE.equals(clase.getCancelada()))
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

    private boolean isAlumnoInWaitingList(Clase clase, Integer alumnoId) {
        if (clase.getListaEspera() == null || clase.getListaEspera().getAlumnos() == null) {
            return false;
        }

        return clase.getListaEspera().getAlumnos().stream()
                .map(Alumno::getId)
                .anyMatch(id -> java.util.Objects.equals(id, alumnoId));
    }

    // HELPER — true si la clase ya alcanzó su cupo.
    private boolean claseLlena(Clase clase) {
        int inscritos = (clase.getListaAsistencia() != null && clase.getListaAsistencia().getAlumnos() != null)
                ? clase.getListaAsistencia().getAlumnos().size()
                : 0;
        int cupo = clase.getCupo() != null ? clase.getCupo() : 0;
        return inscritos >= cupo;
    }

    // HELPER — true si el alumno ya está inscripto en OTRA clase en la misma fecha y hora.
    private boolean alumnoTieneOtraClaseEnHorario(Integer alumnoId, Clase clase) {
        if (alumnoId == null) {
            return false;
        }
        return listForAlumno(alumnoId).stream()
                .anyMatch(c -> c.getIdClase() != clase.getIdClase()
                        && java.util.Objects.equals(c.getFecha(), clase.getFecha())
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

        LocalDate fechaInicio = claseElegida.getFecha();
        if (fechaInicio == null) {
            return List.of();
        }

        // Ventana del abono: desde la clase elegida hasta fin de ese mes.
        LocalDate finDeMes = fechaInicio.withDayOfMonth(fechaInicio.lengthOfMonth());

        // Aseguramos que existan todas las instancias del mes (materialización lazy).
        materializarRango(fechaInicio, finDeMes);

        List<Clase> instancias;
        ClasePlantilla plantilla = claseElegida.getPlantilla();
        if (plantilla != null) {
            instancias = claseRepository.findByPlantilla_IdPlantilla(plantilla.getIdPlantilla()).stream()
                    .filter(c -> c.getFecha() != null
                            && !c.getFecha().isBefore(fechaInicio)
                            && !c.getFecha().isAfter(finDeMes))
                    .sorted(Comparator.comparing(Clase::getFecha))
                    .collect(Collectors.toList());
        } else {
            // Clase suelta (sin serie): el abono cubre solo esa clase.
            instancias = List.of(claseElegida);
        }

        List<AbonoPreviewDTO> preview = new ArrayList<>();
        for (Clase clase : instancias) {
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
            } else if (claseLlena(clase)) {
                disponible = false;
                motivo = AbonoPreviewDTO.Motivo.LLENA;
            }

            String actividad = (clase.getActividad() != null && clase.getActividad().getTipo() != null)
                    ? clase.getActividad().getTipo().name()
                    : "CLASE";

            preview.add(new AbonoPreviewDTO(
                    clase.getIdClase(),
                    clase.getFecha(),
                    clase.getHora() != null ? clase.getHora() : 0,
                    actividad,
                    disponible,
                    motivo
            ));
        }

        return preview;
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

    // HELPER
    private boolean profesorOcupado(LocalDate fecha, int hora, Integer profesorId) {
        if (profesorId == null) return false;
        return !claseRepository.findByFechaAndHoraAndProfesor_Id(fecha, hora, profesorId).isEmpty();
    }

    // HELPER — igual que profesorOcupado pero ignora la clase que se está modificando
    private boolean profesorOcupadoExcluyendo(LocalDate fecha, int hora, Integer profesorId, int idClaseActual) {
        if (profesorId == null) return false;
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
            throw new RuntimeException("El gimnasio no opera los fines de semana. Las clases solo pueden programarse de lunes a viernes.");
        }
    }

    // HELPER
    private void validarFechaHoraFutura(LocalDate fecha, int hora) {
        LocalDateTime fechaHora = fecha.atTime(hora, 0);
        if (!fechaHora.isAfter(LocalDateTime.now())) {
            throw new RuntimeException("No se puede programar una clase en una fecha y hora que ya pasaron.");
        }
    }

    //HELPER
    private boolean horaDisponible(LocalDate fecha, int hora) {
        return this.listarClasesDeUnaFechaYHora(fecha, hora).size() < 3;
    }

    //HELPER
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
            int idClaseActual
    ) {
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
                .anyMatch(clase ->
                        clase.getActividad().getIdActividad().equals(idActividadNueva)
                );
    }


    // 2. AGREGAR / GUARDAR
    public Clase crearClase(Clase clase) {
        validarDiaHabil(clase.getFecha());
        validarFechaHoraFutura(clase.getFecha(), clase.getHora());

        if (clase.getCancelada() == null) {
            clase.setCancelada(false);
        }

        if (clase.getPrecio() == null) {
            clase.setPrecio(0.0);
        }

        List<Clase> clasesFechaYHoraSolicitadas =
                this.listarClasesDeUnaFechaYHora(clase.getFecha(), clase.getHora());

        Integer profesorId = clase.getProfesor() != null ? clase.getProfesor().getId() : null;
        validarActividadDelProfesor(clase.getActividad(), profesorId);

        // El conflicto de disciplina se evalúa primero: cubre los casos de "3 clases en el turno"
        // y "profesor ocupado", ya que esos siempre desembocan en una clase de la misma actividad.
        if (this.mismaDisciplinaEnElTurno(clasesFechaYHoraSolicitadas, clase.getActividad())) {
            throw new RuntimeException("Lo sentimos, no ha sido posible registrar la clase, ya que en ese turno se encuentra registrada la misma disciplina");
        }

        if (!this.horaDisponible(clase.getFecha(), clase.getHora())) {
            throw new RuntimeException("Lo sentimos, el horario ingresado ya tiene 3 clases asignadas. Por favor, pruebe con un horario distinto");
        }

        if (this.profesorOcupado(clase.getFecha(), clase.getHora(), profesorId)) {
            throw new RuntimeException("El profesor seleccionado ya tiene una clase asignada en ese horario.");
        }

        if (!this.cupoDisponibleEnTurno(clasesFechaYHoraSolicitadas, clase.getCupo())) {
            throw new RuntimeException("Lo sentimos, no ha sido posible registrar la clase ya que el cupo máximo de 30 personas ha sido superado, por favor inténtelo de nuevo.");
        }

        return claseRepository.save(clase);
    }

    // 3. BUSCAR POR ID
    public Clase buscarPorId(Integer id) {
        return claseRepository.findById(id).orElseThrow(() -> new RuntimeException("Clase no encontrada"));
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
            throw new RuntimeException("La modificación no se ha podido realizar ya que hay alumnos inscriptos en la clase");
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

        List<Clase> clasesDelTurnoSinLaActual =
                listarClasesDelTurnoExcluyendoClaseActual(nuevaFecha, nuevaHora, id);

        Integer profesorIdNuevo = claseActualizada.getProfesor() != null
                ? claseActualizada.getProfesor().getId()
                : claseExistente.getProfesor() != null ? claseExistente.getProfesor().getId() : null;

        validarActividadDelProfesor(actividadAValidar, profesorIdNuevo);

        // El conflicto de disciplina se evalúa primero: cubre los casos de "3 clases en el turno"
        // y "profesor ocupado", ya que esos siempre desembocan en una clase de la misma actividad.
        if (mismaDisciplinaEnElTurno(clasesDelTurnoSinLaActual, actividadAValidar)) {
            throw new RuntimeException("La modificación no es posible ya que hay una clase de la misma disciplina en el turno seleccionado.");
        }

        if (clasesDelTurnoSinLaActual.size() >= 3) {
            throw new RuntimeException("La modificación no es posible ya que ese turno se encuentra ocupado");
        }

        if (this.profesorOcupadoExcluyendo(nuevaFecha, nuevaHora, profesorIdNuevo, id)) {
            throw new RuntimeException("El profesor seleccionado ya tiene una clase asignada en ese horario.");
        }

        if (!cupoDisponibleEnTurno(clasesDelTurnoSinLaActual, nuevoCupo)) {
            throw new RuntimeException("La modificación no es posible ya que el cupo en el mismo turno excede la capacidad del gimnasio");
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
    public Clase cancelarClase(Integer id) {
        Clase claseExistente = claseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        if (Boolean.TRUE.equals(claseExistente.getCancelada())) {
            throw new RuntimeException("La clase ya se encuentra cancelada");
        }

        ListaAsistencia listaAsistencia = claseExistente.getListaAsistencia();
        if (listaAsistencia != null && listaAsistencia.getAlumnos() != null && !listaAsistencia.getAlumnos().isEmpty()) {
            listaAsistencia.getAlumnos().forEach(alumno -> {
                Integer creditosActuales = alumno.getCreditos() == null ? 0 : alumno.getCreditos();
                alumno.setCreditos(creditosActuales + 1);
            });

            alumnoRepository.saveAll(listaAsistencia.getAlumnos());
        }

        claseExistente.setCancelada(true);
        return claseRepository.save(claseExistente);
    }

    // ============================================================
    // SERIES PERPETUAS (ClasePlantilla) + INSTANCIAS (Clase)
    // ============================================================

    private static final java.util.Map<String, DayOfWeek> DIAS = java.util.Map.of(
            "monday", DayOfWeek.MONDAY,
            "tuesday", DayOfWeek.TUESDAY,
            "wednesday", DayOfWeek.WEDNESDAY,
            "thursday", DayOfWeek.THURSDAY,
            "friday", DayOfWeek.FRIDAY
    );

    // HELPER — genera las fechas semanales desde la próxima ocurrencia del día
    // elegido hasta dentro de 2 meses (misma ventana que usaba el front).
    private List<LocalDate> generarFechasSerie(DayOfWeek dia, int hora) {
        LocalDate hoy = LocalDate.now();
        int diff = (dia.getValue() - hoy.getDayOfWeek().getValue() + 7) % 7;
        LocalDate inicio = hoy.plusDays(diff);

        // Si la primera ocurrencia es hoy pero la hora ya pasó, arrancamos la próxima semana.
        if (diff == 0 && hora <= LocalTime.now().getHour()) {
            inicio = inicio.plusWeeks(1);
        }

        LocalDate fin = hoy.plusMonths(2);
        List<LocalDate> fechas = new ArrayList<>();
        for (LocalDate f = inicio; !f.isAfter(fin); f = f.plusWeeks(1)) {
            fechas.add(f);
        }
        return fechas;
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
                clase.setPrecio(plantilla.getPrecio());
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
        double precio = request.getPrecio() != null ? request.getPrecio() : 0.0;

        Profesor profesor = profesorRepository.findById(request.getProfesorId())
                .orElseThrow(() -> new RuntimeException("El profesor seleccionado no existe."));

        Actividad actividad = new Actividad();
        actividad.setIdActividad(request.getActividadId());

        List<LocalDate> fechas = generarFechasSerie(dia, hora);
        if (fechas.isEmpty()) {
            throw new RuntimeException("No hay fechas disponibles en los próximos dos meses para ese día.");
        }

        ClasePlantilla plantilla = new ClasePlantilla();
        plantilla.setActividad(actividad);
        plantilla.setProfesor(profesor);
        plantilla.setDiaSemana(dia);
        plantilla.setHora(hora);
        plantilla.setCupo(request.getCupo());
        plantilla.setPrecio(precio);
        plantilla.setActiva(true);
        plantilla.setVigenciaDesde(fechas.get(0));
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
                errores
        );
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

    // HELPER — true si el profesor está disponible para dar clase en esa fecha/hora:
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
                throw new RuntimeException("Esta clase no pertenece a una serie, no se puede cambiar el profesor de toda la serie.");
            }

            // Materializamos los próximos 2 meses para tener el período concreto de clases futuras.
            LocalDate hoy = LocalDate.now();
            materializarRango(hoy, hoy.plusMonths(2));

            // Todas las clases de la serie aún no impartidas (futuras, no canceladas).
            List<Clase> futuras = claseRepository.findByPlantilla_IdPlantilla(plantilla.getIdPlantilla()).stream()
                    .filter(c -> !Boolean.TRUE.equals(c.getCancelada()))
                    .filter(this::claseAunNoImpartida)
                    .collect(Collectors.toList());

            // El profesor debe estar disponible en TODO el período; si falla en alguna, no se cambia nada.
            boolean noDisponibleEnAlguna = futuras.stream()
                    .anyMatch(c -> !profesorDisponible(profesor.getId(), c.getFecha(), c.getHora(), c.getIdClase()));
            if (noDisponibleEnAlguna) {
                throw new RuntimeException("El cambio de profesor no pudo realizarse debido a que el profesor seleccionado no se encuentra disponible para todo o una parte del período seleccionado.");
            }

            plantilla.setProfesor(profesor);
            clasePlantillaRepository.save(plantilla);

            futuras.forEach(c -> c.setProfesor(profesor));
            claseRepository.saveAll(futuras);
            return ClaseCalendarioDTO.fromEntity(clase);
        }

        // INDIVIDUAL — solo esta clase.
        if (!profesorDisponible(profesor.getId(), clase.getFecha(), clase.getHora(), clase.getIdClase())) {
            throw new RuntimeException("El cambio de profesor no pudo realizarse debido a que el profesor seleccionado no se encuentra disponible para dar clases en el día y horario seleccionados.");
        }

        clase.setProfesor(profesor);
        return ClaseCalendarioDTO.fromEntity(claseRepository.save(clase));
    }

}