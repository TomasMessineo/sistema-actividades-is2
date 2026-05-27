package com.sportify.backend.services;

import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.ClaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class ClaseService {

    @Autowired
    private ClaseRepository claseRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

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

    public List<Clase> listarClasesDeUnaFechaYHora(LocalDate fecha, int hora) {
        return claseRepository.findByFechaAndHoraAndCanceladaFalse(fecha, hora);
    }

    public List<Clase> listarClasesDeUnaActividad(Actividad actividad) {
        return claseRepository.findByActividad(actividad);
    }

    public List<Clase> listarPorIdActividad(Integer actividadId) {
        return claseRepository.findByActividad_IdActividad(actividadId);
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
        return claseRepository.findByFechaAndHora(fecha, hora)
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
        if (clase.getCancelada() == null) {
            clase.setCancelada(false);
        }

        if (clase.getPrecio() == null) {
            clase.setPrecio(0.0);
        }

        List<Clase> clasesFechaYHoraSolicitadas =
                this.listarClasesDeUnaFechaYHora(clase.getFecha(), clase.getHora());

        if (!this.horaDisponible(clase.getFecha(), clase.getHora())) {
            throw new RuntimeException("Lo sentimos, el horario ingresado ya tiene 3 clases asignadas. Por favor, pruebe con un horario distinto");
        }

        if (this.mismaDisciplinaEnElTurno(clasesFechaYHoraSolicitadas, clase.getActividad())) {
            throw new RuntimeException("Lo sentimos, no ha sido posible registrar la clase, ya que en ese turno se encuentra registrada la misma disciplina");
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
    public Clase modificarClase(Clase claseActualizada, Integer id) {
        Clase claseExistente = claseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        if (tieneAlumnosInscriptos(claseExistente)) {
            throw new RuntimeException("La modificación no se ha podido realizar ya que hay alumnos inscriptos en la clase");
        }

        LocalDate nuevaFecha = claseActualizada.getFecha() != null
                ? claseActualizada.getFecha()
                : claseExistente.getFecha();

        int nuevaHora = claseActualizada.getHora() != 0
                ? claseActualizada.getHora()
                : claseExistente.getHora();

        int nuevoCupo = claseActualizada.getCupo() != 0
                ? claseActualizada.getCupo()
                : claseExistente.getCupo();

        Actividad actividadAValidar = claseActualizada.getActividad() != null
                ? claseActualizada.getActividad()
                : claseExistente.getActividad();

        List<Clase> clasesDelTurnoSinLaActual =
                listarClasesDelTurnoExcluyendoClaseActual(nuevaFecha, nuevaHora, id);

        if (clasesDelTurnoSinLaActual.size() >= 3) {
            throw new RuntimeException("La modificación no es posible ya que ese turno se encuentra ocupado");
        }

        if (mismaDisciplinaEnElTurno(clasesDelTurnoSinLaActual, actividadAValidar)) {
            throw new RuntimeException("La modificación no es posible ya que hay una clase de la misma disciplina en el turno seleccionado.");
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

}