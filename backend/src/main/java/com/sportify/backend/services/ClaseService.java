package com.sportify.backend.services;

import com.sportify.backend.dtos.AbonoPreviewDTO;
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
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.entities.Profesor;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.ClasePlantillaRepository;
import com.sportify.backend.repositories.ClaseRepository;
import com.sportify.backend.repositories.ProfesorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
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
        LocalDate hoy = LocalDate.now();
        int horaActual = LocalTime.now().getHour();

        return claseRepository.findByFechaAndHoraAndProfesor_Id(hoy, horaActual, profesorId)
                .stream()
                .filter(c -> !Boolean.TRUE.equals(c.getCancelada()))
                .findFirst()
                .map(ClaseActualProfesorDTO::fromEntity)
                .orElse(null);
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

    // Alumnos anotados en una clase puntual.
    public List<AlumnoResumenDTO> listarAlumnosDeClase(Integer idClase) {
        Clase clase = claseRepository.findById(idClase)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        if (clase.getListaAsistencia() == null || clase.getListaAsistencia().getAlumnos() == null) {
            return List.of();
        }

        // El join (lista_asistencia_alumnos) puede tener filas duplicadas para un
        // mismo alumno; se deduplica por id antes de mapear a DTO.
        return clase.getListaAsistencia().getAlumnos().stream()
                .collect(Collectors.toMap(Alumno::getId, a -> a, (existente, duplicado) -> existente, LinkedHashMap::new))
                .values()
                .stream()
                .map(AlumnoResumenDTO::fromEntity)
                .toList();
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

    // Cancela una clase individual y reporta a cuántos alumnos se les
    // acreditó un crédito (para mostrarlo en el panel administrativo).
    @Transactional
    public ClaseCancelacionResponse cancelarClaseConDetalle(Integer id) {
        Clase clase = claseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        if (Boolean.TRUE.equals(clase.getCancelada())) {
            throw new RuntimeException("La clase ya se encuentra cancelada");
        }

        int alumnosAcreditados = contarAlumnosInscriptos(clase);
        cancelarClase(id);

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
    // instancias reusando cancelarClase, que ya maneja el reembolso de créditos.
    private ClaseCancelacionResponse cancelarInstancias(List<Clase> instancias) {
        int canceladas = 0;
        int alumnosAcreditados = 0;

        for (Clase clase : instancias) {
            if (Boolean.TRUE.equals(clase.getCancelada())) {
                continue;
            }
            alumnosAcreditados += contarAlumnosInscriptos(clase);
            cancelarClase(clase.getIdClase());
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

        ClaseCancelacionResponse resultado = cancelarInstancias(instancias);
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

        ClaseCancelacionResponse resultado = cancelarInstancias(instanciasFuturas);
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
            LocalDate vigenciaHastaNueva
    ) {
        return clasePlantillaRepository.findByDiaSemanaAndHoraAndActivaTrue(dia, hora)
                .stream()
                .filter(p -> seSuperponenVigencias(
                        p.getVigenciaDesde(), p.getVigenciaHasta(),
                        vigenciaDesdeNueva, vigenciaHastaNueva))
                .toList();
    }

    // HELPER — análogo a mismaDisciplinaEnElTurno, pero evaluado contra plantillas.
    private boolean mismaDisciplinaEnElTurnoPlantilla(List<ClasePlantilla> plantillasSuperpuestas, Actividad actividad) {
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
        if (profesorId == null) return false;
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

        LocalDate vigenciaDesde = fechas.get(0);
        List<ClasePlantilla> plantillasSuperpuestas =
                plantillasSuperpuestasEnElTurno(dia, hora, vigenciaDesde, null);

        // Mismo orden que las validaciones de turno para una Clase concreta:
        // disciplina repetida primero, luego cupo de turno, profesor y cupo total.
        if (mismaDisciplinaEnElTurnoPlantilla(plantillasSuperpuestas, actividad)) {
            throw new RuntimeException("Ya existe una serie de la misma disciplina en ese día y horario.");
        }

        if (!turnoDisponiblePlantilla(plantillasSuperpuestas)) {
            throw new RuntimeException("Ese día y horario ya tiene 3 series asignadas. Por favor, pruebe con un horario distinto.");
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
                errores
        );
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

        String alcance = request.getAlcance() == null ? "INDIVIDUAL" : request.getAlcance().toUpperCase();

        if ("SERIE".equals(alcance)) {
            ClasePlantilla plantilla = clase.getPlantilla();
            if (plantilla == null) {
                throw new RuntimeException("Esta clase no pertenece a una serie, no se puede cambiar el profesor de toda la serie.");
            }

            plantilla.setProfesor(profesor);
            clasePlantillaRepository.save(plantilla);

            // Cambia para todas las clases de la serie de aquí en adelante (no canceladas).
            List<Clase> instancias = claseRepository.findByPlantilla_IdPlantilla(plantilla.getIdPlantilla());
            LocalDate desde = clase.getFecha();
            List<Clase> afectadas = instancias.stream()
                    .filter(c -> !Boolean.TRUE.equals(c.getCancelada()))
                    .filter(c -> c.getFecha() != null && !c.getFecha().isBefore(desde))
                    .peek(c -> c.setProfesor(profesor))
                    .collect(Collectors.toList());

            claseRepository.saveAll(afectadas);
            return ClaseCalendarioDTO.fromEntity(clase);
        }

        // INDIVIDUAL — solo esta clase. Validamos que el profesor no esté ocupado ese turno.
        if (profesorOcupadoExcluyendo(clase.getFecha(), clase.getHora(), profesor.getId(), clase.getIdClase())) {
            throw new RuntimeException("El profesor seleccionado ya tiene una clase asignada en ese horario.");
        }

        clase.setProfesor(profesor);
        return ClaseCalendarioDTO.fromEntity(claseRepository.save(clase));
    }

    // ============================================================
    // PREVIEW DEL ABONO MENSUAL
    // ============================================================
    // Devuelve las clases del mes calendario de la clase elegida que coinciden
    // en actividad + día de semana + hora, con su estado de disponibilidad.
    public List<AbonoPreviewDTO> previewAbono(Integer idClase, Integer idAlumno) {
        Clase claseElegida = claseRepository.findById(idClase)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        LocalDate fechaBase = claseElegida.getFecha();
        int hora = claseElegida.getHora();
        DayOfWeek diaSemana = fechaBase.getDayOfWeek();
        Integer idActividad = claseElegida.getActividad() != null
                ? claseElegida.getActividad().getIdActividad()
                : null;
        String nombreActividad = claseElegida.getActividad() != null && claseElegida.getActividad().getTipo() != null
                ? claseElegida.getActividad().getTipo().name()
                : "CLASE";

        LocalDate primerDiaMes = fechaBase.withDayOfMonth(1);
        LocalDate ultimoDiaMes = fechaBase.withDayOfMonth(fechaBase.lengthOfMonth());

        List<Clase> clasesDelAbono = claseRepository.findAll().stream()
                .filter(c -> c.getActividad() != null
                        && idActividad != null
                        && idActividad.equals(c.getActividad().getIdActividad()))
                .filter(c -> c.getHora() != null && c.getHora() == hora)
                .filter(c -> c.getFecha() != null
                        && !c.getFecha().isBefore(primerDiaMes)
                        && !c.getFecha().isAfter(ultimoDiaMes))
                .filter(c -> c.getFecha().getDayOfWeek() == diaSemana)
                .sorted((a, b) -> a.getFecha().compareTo(b.getFecha()))
                .toList();

        List<AbonoPreviewDTO> resultado = new ArrayList<>();
        for (Clase c : clasesDelAbono) {
            AbonoPreviewDTO.Motivo motivo = evaluarDisponibilidad(c, idAlumno);
            resultado.add(new AbonoPreviewDTO(
                    c.getIdClase(),
                    c.getFecha(),
                    c.getHora(),
                    nombreActividad,
                    motivo == null,
                    motivo
            ));
        }
        return resultado;
    }

    private AbonoPreviewDTO.Motivo evaluarDisponibilidad(Clase clase, Integer idAlumno) {
        if (Boolean.TRUE.equals(clase.getCancelada())) {
            return AbonoPreviewDTO.Motivo.CANCELADA;
        }

        int inscriptos = clase.getListaAsistencia() != null && clase.getListaAsistencia().getAlumnos() != null
                ? clase.getListaAsistencia().getAlumnos().size()
                : 0;
        int cupo = clase.getCupo() == null ? 0 : clase.getCupo();

        if (idAlumno != null && clase.getListaAsistencia() != null && clase.getListaAsistencia().getAlumnos() != null
                && clase.getListaAsistencia().getAlumnos().stream()
                .anyMatch(a -> java.util.Objects.equals(a.getId(), idAlumno))) {
            return AbonoPreviewDTO.Motivo.YA_INSCRIPTO;
        }

        if (inscriptos >= cupo) {
            return AbonoPreviewDTO.Motivo.LLENA;
        }

        if (idAlumno != null && tieneConflictoHorario(idAlumno, clase)) {
            return AbonoPreviewDTO.Motivo.CONFLICTO_HORARIO;
        }

        return null; // disponible
    }

    private boolean tieneConflictoHorario(Integer idAlumno, Clase clase) {
        return claseRepository.findByFechaAndHoraAndCanceladaFalse(clase.getFecha(), clase.getHora()).stream()
                .filter(c -> c.getIdClase() != clase.getIdClase())
                .anyMatch(c -> c.getListaAsistencia() != null
                        && c.getListaAsistencia().getAlumnos() != null
                        && c.getListaAsistencia().getAlumnos().stream()
                        .anyMatch(a -> java.util.Objects.equals(a.getId(), idAlumno)));
    }

}