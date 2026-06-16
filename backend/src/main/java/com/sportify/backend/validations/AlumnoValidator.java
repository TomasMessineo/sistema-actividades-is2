package com.sportify.backend.validations;

import com.sportify.backend.entities.Alumno;
import com.sportify.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class AlumnoValidator {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public void validarRegistro(Alumno alumno) {
        normalizarDatos(alumno);
        validarFormatoDni(alumno.getDni());
        validarFormatoEmail(alumno.getEmail());
        validarEdad(alumno.getFechaNacimiento());
        validarDniDuplicado(alumno);
        validarEmailDuplicado(alumno);
    }

    public void validarEmailDisponibleParaEdicion(Alumno alumno) {
        if (alumno.getEmail() != null) {
            alumno.setEmail(normalizarEmail(alumno.getEmail()));
        }
        validarFormatoEmail(alumno.getEmail());
        validarEmailDuplicado(alumno);
    }

    private void normalizarDatos(Alumno alumno) {
        if (alumno.getDni() != null) {
            alumno.setDni(normalizarDni(alumno.getDni()));
        }
        if (alumno.getEmail() != null) {
            alumno.setEmail(normalizarEmail(alumno.getEmail()));
        }
    }

    private String normalizarDni(String dni) {
        // Saca espacios, puntos y guiones para que "44 444 444" == "44.444.444" == "44444444"
        return dni.replaceAll("[\\s.\\-]", "");
    }

    private String normalizarEmail(String email) {
        // Trim + lowercase para que "Pepe@Mail.com" == "pepe@mail.com"
        return email.trim().toLowerCase();
    }

    private void validarFormatoDni(String dni) {
        if (dni == null || dni.isBlank()) {
            throw new IllegalArgumentException("La cuenta no ha podido crearse debido a que el DNI es obligatorio");
        }
        if (!dni.matches("\\d{7,8}")) {
            throw new IllegalArgumentException("La cuenta no ha podido crearse debido a que el DNI ingresado no es válido");
        }
    }

    private void validarFormatoEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("La cuenta no ha podido crearse debido a que el email es obligatorio");
        }
        if (!email.matches("^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$")) {
            throw new IllegalArgumentException("La cuenta no ha podido crearse debido a que el email ingresado no es válido");
        }
    }

    private void validarEdad(LocalDate fechaNacimiento) {
        LocalDate hace16Anios = LocalDate.now().minusYears(16);
        if (fechaNacimiento != null && fechaNacimiento.isAfter(hace16Anios)) {
            // Se lanza una excepción controlada con la frase exacta estipulada en la Historia de Usuario
            throw new IllegalArgumentException("la cuenta no ha podido crearse debido a que el usuario debe tener mas de 16 años");
        }
    }

    private void validarDniDuplicado(Alumno alumno) {
        usuarioRepository.findByDni(alumno.getDni()).ifPresent(usuarioExistente -> {
            if (alumno.getId() == null || !alumno.getId().equals(usuarioExistente.getId())) {
                throw new IllegalArgumentException("La cuenta no ha podido crearse debido a que el DNI ya se encuentra registrado en el sistema");
            }
        });
    }

    private void validarEmailDuplicado(Alumno alumno) {
        usuarioRepository.findByEmail(alumno.getEmail()).ifPresent(usuarioExistente -> {
            if (alumno.getId() == null || !alumno.getId().equals(usuarioExistente.getId())) {
                throw new IllegalArgumentException("La cuenta no ha podido crearse debido a que el email ya se encuentra registrado en el sistema");
            }
        });
    }
}
