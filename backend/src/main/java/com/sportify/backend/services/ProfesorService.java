package com.sportify.backend.services;

import com.sportify.backend.dtos.ClasePendienteDTO;
import com.sportify.backend.dtos.RegistroProfesorDTO;
import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.Profesor;
import com.sportify.backend.exceptions.ProfesorConClasesActivasException;
import com.sportify.backend.repositories.ActividadRepository;
import com.sportify.backend.repositories.ClaseRepository;
import com.sportify.backend.repositories.ProfesorRepository;
import com.sportify.backend.validations.ProfesorValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfesorService {

    @Autowired
    private ProfesorRepository profesorRepository;

    @Autowired
    private ActividadRepository actividadRepository;

    @Autowired
    private ClaseRepository claseRepository;

    @Autowired
    private ProfesorValidator profesorValidator;

    public List<Profesor> listarTodos() {
        return profesorRepository.findByActivoTrue();
    }

    public List<Profesor> listarEliminados() {
        return profesorRepository.findByActivoFalse();
    }

    public List<Profesor> listarPorActividad(Integer idActividad) {
        return profesorRepository.findByActividad_IdActividadAndActivoTrue(idActividad);
    }

    public Profesor buscarPorId(Integer id) {
        return profesorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
    }

    public Profesor registrar(RegistroProfesorDTO dto) {
        if (dto.getActividadId() == null) {
            throw new IllegalArgumentException("Debe seleccionar la disciplina que dicta el profesor");
        }
        Actividad actividad = actividadRepository.findById(dto.getActividadId())
                .orElseThrow(() -> new IllegalArgumentException("La disciplina seleccionada no existe"));

        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (dto.getApellido() == null || dto.getApellido().isBlank()) {
            throw new IllegalArgumentException("El apellido es obligatorio");
        }

        Profesor profesor = new Profesor();
        profesor.setNombre(dto.getNombre().trim());
        profesor.setApellido(dto.getApellido().trim());
        profesor.setDni(dto.getDni());
        profesor.setEmail(dto.getEmail());
        profesor.setPassword(dto.getPassword());
        profesor.setFechaUltimoCambioPassword(LocalDateTime.now());
        profesor.setActivo(true);
        profesor.setActividad(actividad);

        profesorValidator.validarRegistro(profesor);

        return profesorRepository.save(profesor);
    }

    public void desactivar(Integer id) {
        Profesor profesor = profesorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        List<ClasePendienteDTO> clasesPendientes = obtenerClasesActivasPendientes(id);
        if (!clasesPendientes.isEmpty()) {
            throw new ProfesorConClasesActivasException(
                    "No se pudo eliminar el profesor porque posee clases activas pendientes. Antes debe modificar las clases asignando un reemplazo.",
                    clasesPendientes);
        }

        profesor.setActivo(false);
        profesorRepository.save(profesor);
    }

    public List<ClasePendienteDTO> obtenerClasesActivasPendientes(Integer idProfesor) {
        LocalDate hoy = LocalDate.now();
        return claseRepository.findByProfesorId(idProfesor).stream()
                .filter(c -> !Boolean.TRUE.equals(c.getCancelada()))
                .filter(c -> c.getFecha() != null && !c.getFecha().isBefore(hoy))
                .sorted((a, b) -> a.getFecha().compareTo(b.getFecha()))
                .map(this::convertirAClasePendienteDTO)
                .collect(Collectors.toList());
    }

    private ClasePendienteDTO convertirAClasePendienteDTO(Clase clase) {
        String actividad = clase.getActividad() != null && clase.getActividad().getTipo() != null
                ? clase.getActividad().getTipo()
                : "CLASE";
        return new ClasePendienteDTO(
                clase.getIdClase(),
                clase.getFecha(),
                clase.getHora() == null ? 0 : clase.getHora(),
                actividad);
    }
}
