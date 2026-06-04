package com.sportify.backend.services;

import com.sportify.backend.dtos.AbonoPreviewDTO;
import com.sportify.backend.dtos.CrearClasesLoteRequest;
import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.entities.Profesor;
import com.sportify.backend.repositories.ActividadRepository;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.ClaseRepository;
import com.sportify.backend.repositories.ProfesorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class ClaseService {

    @Autowired
    private ClaseRepository claseRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private ProfesorRepository profesorRepository;

    @Autowired
    private ActividadRepository actividadRepository;

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
                        .anyMatch(alumno -> alumno.getId() == alumnoId))
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
                .anyMatch(id -> id == alumnoId);
    }

    private boolean isAlumnoInWaitingList(Clase clase, Integer alumnoId) {
        if (clase.getListaEspera() == null || clase.getListaEspera().getAlumnos() == null) {
            return false;
        }

        return clase.getListaEspera().getAlumnos().stream()
                .map(Alumno::getId)
                .anyMatch(id -> id == alumnoId);
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

    // CREAR LOTE DE CLASES — atómico (todo o nada)
    // Si alguna fecha conflictúa, se hace rollback completo y no se crea ninguna.
    @Transactional
    public List<Clase> crearClasesLote(CrearClasesLoteRequest request) {
        if (request.getFechas() == null || request.getFechas().isEmpty()) {
            throw new RuntimeException("Debe enviar al menos una fecha");
        }
        if (request.getActividadId() == null) {
            throw new RuntimeException("La actividad es obligatoria");
        }
        if (request.getProfesorId() == null) {
            throw new RuntimeException("El profesor es obligatorio");
        }
        if (request.getHora() == null) {
            throw new RuntimeException("La hora es obligatoria");
        }
        if (request.getCupo() == null || request.getCupo() <= 0) {
            throw new RuntimeException("El cupo es obligatorio y debe ser mayor a 0");
        }

        Actividad actividad = actividadRepository.findById(request.getActividadId())
                .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));
        Profesor profesor = profesorRepository.findById(request.getProfesorId())
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        // Validamos que el profesor dicte esa actividad una sola vez (no fecha por fecha)
        if (profesor.getActividad() == null
                || !profesor.getActividad().getIdActividad().equals(actividad.getIdActividad())) {
            throw new RuntimeException("El profesor seleccionado no dicta esta actividad.");
        }

        List<Clase> creadas = new ArrayList<>();
        for (LocalDate fecha : request.getFechas()) {
            Clase nueva = new Clase();
            nueva.setFecha(fecha);
            nueva.setHora(request.getHora());
            nueva.setCupo(request.getCupo());
            nueva.setActividad(actividad);
            nueva.setProfesor(profesor);
            nueva.setCancelada(false);
            nueva.setPrecio(0.0);

            // Reusa toda la lógica de validación existente
            // Si alguna lanza excepción → rollback de toda la transacción
            Clase guardada = crearClase(nueva);
            creadas.add(guardada);
        }

        return creadas;
    }

    // PREVIEW DEL ABONO MENSUAL
    // Devuelve todas las clases del mes calendario de la clase elegida que coinciden
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

        // Filtra todas las clases del mes que matcheen actividad + día semana + hora
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
                && clase.getListaAsistencia().getAlumnos().stream().anyMatch(a -> a.getId() == idAlumno)) {
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
        // Busca otra clase del alumno en la misma fecha y hora, distinta de esta
        return claseRepository.findByFechaAndHoraAndCanceladaFalse(clase.getFecha(), clase.getHora()).stream()
                .filter(c -> c.getIdClase() != clase.getIdClase())
                .anyMatch(c -> c.getListaAsistencia() != null
                        && c.getListaAsistencia().getAlumnos() != null
                        && c.getListaAsistencia().getAlumnos().stream().anyMatch(a -> a.getId() == idAlumno));
    }

}