package com.sportify.backend.validations;

import com.sportify.backend.entities.Profesor;
import com.sportify.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProfesorValidator {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public void validarRegistro(Profesor profesor) {
        normalizarDatos(profesor);
        validarFormatoDni(profesor.getDni());
        validarFormatoEmail(profesor.getEmail());
        validarActividad(profesor);
        validarDniDuplicado(profesor);
        validarEmailDuplicado(profesor);
    }

    private void normalizarDatos(Profesor profesor) {
        if (profesor.getDni() != null) {
            profesor.setDni(normalizarDni(profesor.getDni()));
        }
        if (profesor.getEmail() != null) {
            profesor.setEmail(normalizarEmail(profesor.getEmail()));
        }
    }

    private String normalizarDni(String dni) {
        return dni.replaceAll("[\\s.\\-]", "");
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }

    private void validarFormatoDni(String dni) {
        if (dni == null || dni.isBlank()) {
            throw new IllegalArgumentException("El DNI es obligatorio");
        }
        if (!dni.matches("\\d{7,8}")) {
            throw new IllegalArgumentException("El DNI ingresado no es válido");
        }
    }

    private void validarFormatoEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("El email es obligatorio");
        }
        if (!email.matches("^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$")) {
            throw new IllegalArgumentException("El email ingresado no es válido");
        }
    }

    private void validarActividad(Profesor profesor) {
        if (profesor.getActividad() == null || profesor.getActividad().getIdActividad() == null) {
            throw new IllegalArgumentException("Debe seleccionar la disciplina que dicta el profesor");
        }
    }

    private void validarDniDuplicado(Profesor profesor) {
        usuarioRepository.findByDni(profesor.getDni()).ifPresent(usuarioExistente -> {
            if (profesor.getId() == null || !profesor.getId().equals(usuarioExistente.getId())) {
                throw new IllegalArgumentException("El DNI ya se encuentra registrado en el sistema");
            }
        });
    }

    private void validarEmailDuplicado(Profesor profesor) {
        usuarioRepository.findByEmail(profesor.getEmail()).ifPresent(usuarioExistente -> {
            if (profesor.getId() == null || !profesor.getId().equals(usuarioExistente.getId())) {
                throw new IllegalArgumentException("El email ya se encuentra registrado en el sistema");
            }
        });
    }
}
