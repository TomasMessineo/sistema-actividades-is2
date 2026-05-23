package com.sportify.backend.validations;

import com.sportify.backend.entities.Alumno;
import com.sportify.backend.repositories.AlumnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class AlumnoValidator {

    @Autowired
    private AlumnoRepository alumnoRepository;

    public void validarRegistro(Alumno alumno) {
        validarEdad(alumno.getFechaNacimiento());
        validarDniDuplicado(alumno);
        validarEmailDuplicado(alumno);
    }

    private void validarEdad(LocalDate fechaNacimiento) {
        LocalDate hace16Anios = LocalDate.now().minusYears(16);
        if (fechaNacimiento != null && fechaNacimiento.isAfter(hace16Anios)) {
            // Se lanza una excepción controlada con la frase exacta estipulada en la Historia de Usuario
            throw new IllegalArgumentException("la cuenta no ha podido crearse debido a que el usuario debe tener mas de 16 años");
        }
    }

    private void validarDniDuplicado(Alumno alumno) {
        alumnoRepository.findByDni(alumno.getDni()).ifPresent(alumnoExistente -> {
            if (alumno.getId() == 0 || alumno.getId() != alumnoExistente.getId()) {
                throw new IllegalArgumentException("La cuenta no ha podido crearse debido a que el DNI ya se encuentra registrado en el sistema");
            }
        });
    }

    private void validarEmailDuplicado(Alumno alumno) {
        alumnoRepository.findByEmail(alumno.getEmail()).ifPresent(alumnoExistente -> {
            if (alumno.getId() == 0 || alumno.getId() != alumnoExistente.getId()) {
                throw new IllegalArgumentException("La cuenta no ha podido crearse debido a que el email ya se encuentra registrado en el sistema");
            }
        });
    }
}
