package com.sportify.backend.services;

import com.sportify.backend.dtos.ActualizarPerfilAlumnoDTO;
import com.sportify.backend.entities.FotoDePerfil;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.validations.AlumnoValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AlumnoService {

    private static final Path PROFILE_PICTURES_DIR = Paths.get("..", "profile-pictures").normalize();
    private static final long MAX_PROFILE_PICTURE_SIZE = 2 * 1024 * 1024;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private AlumnoValidator alumnoValidator;

    // 1. LISTAR (solo activos)
    public List<Alumno> listarTodos() {
        return alumnoRepository.findByActivoTrue();
    }

    // 2. AGREGAR / GUARDAR
    public Alumno guardar(Alumno alumno) {

        // Delegamos todas las validaciones de negocio a nuestra clase especializada
        alumnoValidator.validarRegistro(alumno);

        // Si no se arrojó ninguna excepción, se crea o actualiza el alumno sin
        // problemas
        return alumnoRepository.save(alumno);
    }

    // 3. BUSCAR POR ID
    public Alumno buscarPorId(Integer id) {
        return alumnoRepository.findById(id).orElseThrow(() -> new RuntimeException("Alumno no encontrado"));
    }

    // 4. ELIMINAR (borrado lógico)
    public void desactivar(Integer id) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));
        alumno.setActivo(false);
        alumnoRepository.save(alumno);
    }
    // 4. ELIMINAR
    public void eliminarAlumno(Integer id) {
            Alumno temp= this.alumnoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

            temp.setActivo(false);
            alumnoRepository.save(temp);

        }


    // 5. INICIAR SESIÓN
    public Alumno iniciarSesion(String email, String password) {
        Alumno alumno = alumnoRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Los datos ingresados son inválidos, debe intentarse nuevamente."));

        if (!alumno.getPassword().equals(password)) {
            throw new IllegalArgumentException("Los datos ingresados son inválidos, debe intentarse nuevamente.");
        }

        return alumno;
    }

    // 6. ACTUALIZAR PERFIL
    public Alumno actualizarPerfil(Integer id, ActualizarPerfilAlumnoDTO datos) {
        Alumno alumno = buscarPorId(id);

        if (datos.getNombre() != null && !datos.getNombre().trim().isEmpty()) {
            alumno.setNombre(datos.getNombre().trim());
        }

        if (datos.getApellido() != null && !datos.getApellido().trim().isEmpty()) {
            alumno.setApellido(datos.getApellido().trim());
        }

        if (datos.getEmail() != null && !datos.getEmail().trim().isEmpty()) {
            String emailNormalizado = datos.getEmail().trim().toLowerCase();
            alumno.setEmail(emailNormalizado);
            alumnoValidator.validarEmailDisponibleParaEdicion(alumno);
        }

        if (datos.getPassword() != null && !datos.getPassword().trim().isEmpty()) {
            if (datos.getCurrentPassword() == null || datos.getCurrentPassword().trim().isEmpty()) {
                throw new IllegalArgumentException("Debes ingresar tu contraseña actual para cambiarla.");
            }

            if (!alumno.getPassword().equals(datos.getCurrentPassword())) {
                throw new IllegalArgumentException("La contraseña actual no es correcta.");
            }

            if (alumno.getPassword().equals(datos.getPassword())) {
                throw new IllegalArgumentException("La nueva contraseña no puede ser igual a la actual.");
            }

            alumno.setPassword(datos.getPassword());
            alumno.setFechaUltimoCambioPassword(LocalDateTime.now());
        }

        return alumnoRepository.save(alumno);
    }

    public Alumno actualizarFotoDePerfil(Integer id, MultipartFile archivo) throws IOException {
        Alumno alumno = buscarPorId(id);

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("Debes seleccionar una imagen para subirla.");
        }

        validarFotoDePerfil(archivo);

        Files.createDirectories(PROFILE_PICTURES_DIR);

        String originalFilename = archivo.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String storedFileName = UUID.randomUUID() + fileExtension;
        Path storedFilePath = PROFILE_PICTURES_DIR.resolve(storedFileName);

        try (InputStream inputStream = archivo.getInputStream()) {
            Files.copy(inputStream, storedFilePath, StandardCopyOption.REPLACE_EXISTING);
        }

        FotoDePerfil fotoDePerfil = alumno.getFotoDePerfil();
        if (fotoDePerfil == null) {
            fotoDePerfil = new FotoDePerfil();
            fotoDePerfil.setUsuario(alumno);
        }

        fotoDePerfil.setUrl(ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/profile-pictures/")
                .path(storedFileName)
                .toUriString());

        alumno.setFotoDePerfil(fotoDePerfil);
        return alumnoRepository.save(alumno);
    }

    private void validarFotoDePerfil(MultipartFile archivo) {
        if (archivo.getSize() > MAX_PROFILE_PICTURE_SIZE) {
            throw new IllegalArgumentException("La imagen no puede superar los 2 MB");
        }

        String contentType = archivo.getContentType();
        if (contentType == null || (!contentType.equals("image/png")
                && !contentType.equals("image/jpeg")
                && !contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Solo se permiten imágenes PNG, JPG o WEBP");
        }
    }
}