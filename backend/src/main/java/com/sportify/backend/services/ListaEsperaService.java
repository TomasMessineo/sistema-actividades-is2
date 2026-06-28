package com.sportify.backend.services;

import com.sportify.backend.dtos.ClaseEnEsperaDTO;
import com.sportify.backend.dtos.InscripcionRequest;
import com.sportify.backend.dtos.ListaEsperaRequest;
import com.sportify.backend.dtos.ListaEsperaResponse;
import com.sportify.backend.entities.Alumno;
import com.sportify.backend.entities.Clase;
import com.sportify.backend.entities.EsperaAlumno;
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.entities.ListaEspera;
import com.sportify.backend.entities.Pago;
import com.sportify.backend.repositories.AlumnoRepository;
import com.sportify.backend.repositories.AptoMedicoRepository;
import com.sportify.backend.repositories.ClaseRepository;
import com.sportify.backend.repositories.EsperaAlumnoRepository;
import com.sportify.backend.repositories.ListaAsistenciaRepository;
import com.sportify.backend.repositories.ListaEsperaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ListaEsperaService {

    private final AlumnoRepository alumnoRepository;
    private final ClaseRepository claseRepository;
    private final ListaEsperaRepository listaEsperaRepository;
    private final ListaAsistenciaRepository listaAsistenciaRepository;
    private final EsperaAlumnoRepository esperaAlumnoRepository;
    private final AptoMedicoRepository aptoMedicoRepository;
    private final InscripcionService inscripcionService;
    private final EmailService emailService;

    public ListaEsperaService(
            AlumnoRepository alumnoRepository,
            ClaseRepository claseRepository,
            ListaEsperaRepository listaEsperaRepository,
            ListaAsistenciaRepository listaAsistenciaRepository,
            EsperaAlumnoRepository esperaAlumnoRepository,
            AptoMedicoRepository aptoMedicoRepository,
            InscripcionService inscripcionService,
            EmailService emailService) {
        this.alumnoRepository = alumnoRepository;
        this.claseRepository = claseRepository;
        this.listaEsperaRepository = listaEsperaRepository;
        this.listaAsistenciaRepository = listaAsistenciaRepository;
        this.esperaAlumnoRepository = esperaAlumnoRepository;
        this.aptoMedicoRepository = aptoMedicoRepository;
        this.inscripcionService = inscripcionService;
        this.emailService = emailService;
    }

    // ============================================================
    // 1. ANOTARSE EN LISTA DE ESPERA
    // ============================================================
    @Transactional
    public ListaEsperaResponse inscribir(ListaEsperaRequest request) {
        Alumno alumno = alumnoRepository.findById(request.getIdAlumno())
                .orElseThrow(() -> new RuntimeException("El alumno no existe"));

        Clase clase = claseRepository.findById(request.getIdClase())
                .orElseThrow(() -> new RuntimeException("La clase no existe"));

        if (!aptoMedicoRepository.tieneAptoMedicoValido(request.getIdAlumno(), clase.getFecha())) {
            throw new RuntimeException("Tu certificado médico no es válido para la fecha de la clase");
        }

        // Choque de horario con otra clase a la que ya está inscripto
        listaAsistenciaRepository.findAll().stream()
                .filter(la -> la.getAlumnos() != null &&
                        la.getAlumnos().stream().anyMatch(a -> Objects.equals(a.getId(), request.getIdAlumno())))
                .map(ListaAsistencia::getClase)
                .filter(c -> c.getFecha().equals(clase.getFecha()) && c.getHora().equals(clase.getHora()))
                .findFirst()
                .ifPresent(c -> { throw new RuntimeException("Ya estás anotado a otra clase en ese horario"); });

        ListaEspera lista = listaEsperaRepository.findByClaseIdClase(request.getIdClase())
                .orElseGet(() -> {
                    ListaEspera nueva = new ListaEspera();
                    nueva.setClase(clase);
                    nueva.setIntegrantes(new ArrayList<>());
                    return nueva;
                });

        if (lista.getIntegrantes() == null) lista.setIntegrantes(new ArrayList<>());

        boolean yaEnLista = lista.getIntegrantes().stream()
                .anyMatch(ea -> Objects.equals(ea.getAlumno().getId(), request.getIdAlumno()));
        if (yaEnLista) {
            throw new RuntimeException("Ya estás en la lista de espera de esta clase");
        }

        int proximaPosicion = lista.getIntegrantes().stream()
                .filter(ea -> ea.getPosicion() != null)
                .mapToInt(EsperaAlumno::getPosicion)
                .max()
                .orElse(0) + 1;

        EsperaAlumno integrante = new EsperaAlumno();
        integrante.setListaEspera(lista);
        integrante.setAlumno(alumno);
        integrante.setPosicion(proximaPosicion);
        integrante.setTieneAcceso(false);
        lista.getIntegrantes().add(integrante);

        ListaEspera guardada = listaEsperaRepository.save(lista);

        return new ListaEsperaResponse(
                guardada.getIdListaEspera(),
                "Te anotamos en la lista de espera. Tu posición: " + proximaPosicion,
                proximaPosicion);
    }

    // ============================================================
    // 2. VISUALIZAR CLASES EN ESPERA DEL ALUMNO
    // ============================================================
    @Transactional(readOnly = true)
    public List<ClaseEnEsperaDTO> listarPorAlumno(Integer idAlumno) {
        LocalDate hoy = LocalDate.now();

        return esperaAlumnoRepository.findByAlumno_Id(idAlumno).stream()
                .filter(ea -> ea.getListaEspera() != null && ea.getListaEspera().getClase() != null)
                .map(ea -> {
                    Clase clase = ea.getListaEspera().getClase();
                    return new ClaseEnEsperaDTO(
                            clase.getIdClase(),
                            clase.getFecha(),
                            clase.getHora() == null ? 0 : clase.getHora(),
                            nombreActividad(clase),
                            ea.getPosicion() == null ? 0 : ea.getPosicion(),
                            Boolean.TRUE.equals(ea.getTieneAcceso())
                    );
                })
                .filter(dto -> dto.getFecha() != null && !dto.getFecha().isBefore(hoy))
                .sorted(Comparator.comparing(ClaseEnEsperaDTO::getFecha))
                .collect(Collectors.toList());
    }

    // ============================================================
    // 3. CONFIRMAR ASISTENCIA (desde la lista de espera, con acceso)
    // ============================================================
    @Transactional
    public InscripcionResponseConfirmacion confirmarConCredito(int idAlumno, int idClase) {
        EsperaAlumno integrante = obtenerIntegranteConAcceso(idAlumno, idClase);

        InscripcionRequest req = new InscripcionRequest();
        req.setIdAlumno(idAlumno);
        req.setIdClase(idClase);
        req.setTipoClase(Pago.TipoClase.INDIVIDUAL);
        req.setMetodoPago(Pago.TipoPago.CREDITOS);

        // Esto descuenta crédito, anota al alumno y (vía registrarAsistencia) lo saca de la espera
        inscripcionService.iniciarInscripcion(req);

        return new InscripcionResponseConfirmacion("Inscripción confirmada con crédito");
    }

    // Valida que el alumno tenga acceso habilitado para confirmar esta clase
    public void validarAccesoParaPago(int idAlumno, int idClase) {
        obtenerIntegranteConAcceso(idAlumno, idClase);
    }

    private EsperaAlumno obtenerIntegranteConAcceso(int idAlumno, int idClase) {
        ListaEspera lista = listaEsperaRepository.findByClaseIdClase(idClase)
                .orElseThrow(() -> new RuntimeException("No estás en la lista de espera de esta clase"));

        EsperaAlumno integrante = lista.getIntegrantes().stream()
                .filter(ea -> Objects.equals(ea.getAlumno().getId(), idAlumno))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No estás en la lista de espera de esta clase"));

        if (!Boolean.TRUE.equals(integrante.getTieneAcceso())) {
            throw new RuntimeException("Todavía no tenés un cupo habilitado para esta clase");
        }
        return integrante;
    }

    // ============================================================
    // 4 y 5. CANCELAR ASISTENCIA (de un alumno ya inscripto)
    // ============================================================
    @Transactional
    public String cancelarAsistencia(int idAlumno, int idClase) {
        Clase clase = claseRepository.findById(idClase)
                .orElseThrow(() -> new RuntimeException("La clase no existe"));

        Alumno alumno = alumnoRepository.findById(idAlumno)
                .orElseThrow(() -> new RuntimeException("El alumno no existe"));

        ListaAsistencia listaAsistencia = listaAsistenciaRepository.findByClaseIdClase(idClase)
                .orElseThrow(() -> new RuntimeException("No estás inscripto en esta clase"));

        boolean estaba = listaAsistencia.getAlumnos() != null
                && listaAsistencia.getAlumnos().removeIf(a -> Objects.equals(a.getId(), idAlumno));

        if (!estaba) {
            throw new RuntimeException("No estás inscripto en esta clase");
        }
        listaAsistenciaRepository.save(listaAsistencia);

        // Regla de las 24hs: si cancela con al menos 24hs de anticipación, recupera 1 crédito
        LocalDateTime inicioClase = clase.getFecha().atTime(clase.getHora() == null ? 0 : clase.getHora(), 0);
        boolean conAnticipacion = LocalDateTime.now().plusHours(24).isBefore(inicioClase)
                || LocalDateTime.now().plusHours(24).isEqual(inicioClase);

        String mensajeCredito;
        if (conAnticipacion) {
            int creditos = alumno.getCreditos() == null ? 0 : alumno.getCreditos();
            alumno.setCreditos(creditos + 1);
            alumnoRepository.save(alumno);
            mensajeCredito = " Se te devolvió 1 crédito.";
        } else {
            mensajeCredito = " Al cancelar con menos de 24hs no se devuelve el crédito.";
        }

        // Se liberó un cupo → habilitar al primero de la cola de espera (si hay)
        boolean huboNotificado = habilitarPrimeroDeLaCola(idClase);

        if (huboNotificado) {
            return "Cancelación exitosa." + mensajeCredito + " Se notificó al primer alumno de la lista de espera.";
        }
        return "Cancelación exitosa." + mensajeCredito;
    }

    // Habilita el cupo al primer alumno sin acceso de la cola, reordena y envía email mock.
    // Devuelve true si efectivamente notificó a alguien.
    private boolean habilitarPrimeroDeLaCola(int idClase) {
        ListaEspera lista = listaEsperaRepository.findByClaseIdClase(idClase).orElse(null);
        if (lista == null || lista.getIntegrantes() == null || lista.getIntegrantes().isEmpty()) {
            return false;
        }

        EsperaAlumno primero = lista.getIntegrantes().stream()
                .filter(ea -> !Boolean.TRUE.equals(ea.getTieneAcceso()))
                .filter(ea -> ea.getPosicion() != null)
                .min(Comparator.comparingInt(EsperaAlumno::getPosicion))
                .orElse(null);

        if (primero == null) {
            return false;
        }

        int posicionLiberada = primero.getPosicion();

        // El primero obtiene acceso y sale de la numeración de la cola
        primero.setTieneAcceso(true);
        primero.setPosicion(0);

        // El resto de los que siguen esperando suben una posición
        lista.getIntegrantes().stream()
                .filter(ea -> !Boolean.TRUE.equals(ea.getTieneAcceso()))
                .filter(ea -> ea.getPosicion() != null && ea.getPosicion() > posicionLiberada)
                .forEach(ea -> ea.setPosicion(ea.getPosicion() - 1));

        listaEsperaRepository.save(lista);

        Alumno alumno = primero.getAlumno();
        emailService.notificarCupoLiberado(
                alumno.getEmail(),
                alumno.getNombre(),
                nombreActividad(lista.getClase()) + " " + lista.getClase().getFecha()
                        + " " + (lista.getClase().getHora() == null ? "" : lista.getClase().getHora() + ":00")
        );

        return true;
    }

    private String nombreActividad(Clase clase) {
        return clase.getActividad() != null && clase.getActividad().getTipo() != null
                ? clase.getActividad().getTipo().name()
                : "CLASE";
    }

    // Pequeño wrapper de respuesta para confirmar con crédito
    public static class InscripcionResponseConfirmacion {
        private String mensaje;

        public InscripcionResponseConfirmacion(String mensaje) {
            this.mensaje = mensaje;
        }

        public String getMensaje() { return mensaje; }
        public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    }
}
