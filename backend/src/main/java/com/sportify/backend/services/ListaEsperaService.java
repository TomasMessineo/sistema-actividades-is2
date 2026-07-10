package com.sportify.backend.services;

import com.sportify.backend.dtos.ClaseEnEsperaDTO;
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
import com.sportify.backend.repositories.PagoRepository;
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

    private static final int STRIKES_LIMITE = 3;

    private final AlumnoRepository alumnoRepository;
    private final ClaseRepository claseRepository;
    private final ListaEsperaRepository listaEsperaRepository;
    private final ListaAsistenciaRepository listaAsistenciaRepository;
    private final EsperaAlumnoRepository esperaAlumnoRepository;
    private final AptoMedicoRepository aptoMedicoRepository;
    private final PagoRepository pagoRepository;
    private final PagoService pagoService;
    private final EmailService emailService;

    public ListaEsperaService(
            AlumnoRepository alumnoRepository,
            ClaseRepository claseRepository,
            ListaEsperaRepository listaEsperaRepository,
            ListaAsistenciaRepository listaAsistenciaRepository,
            EsperaAlumnoRepository esperaAlumnoRepository,
            AptoMedicoRepository aptoMedicoRepository,
            PagoRepository pagoRepository,
            PagoService pagoService,
            EmailService emailService) {
        this.alumnoRepository = alumnoRepository;
        this.claseRepository = claseRepository;
        this.listaEsperaRepository = listaEsperaRepository;
        this.listaAsistenciaRepository = listaAsistenciaRepository;
        this.esperaAlumnoRepository = esperaAlumnoRepository;
        this.aptoMedicoRepository = aptoMedicoRepository;
        this.pagoRepository = pagoRepository;
        this.pagoService = pagoService;
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

        // Nadie puede anotarse en la espera de una clase que ya empezó o terminó.
        if (clase.getFecha() != null && clase.getHora() != null
                && !clase.getFecha().atTime(clase.getHora(), 0)
                        .isAfter(LocalDateTime.now(java.time.ZoneId.of("America/Argentina/Buenos_Aires")))) {
            throw new RuntimeException("No podés anotarte a una clase que ya ocurrió o está en curso.");
        }

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
        // Valida que el alumno esté en la cola y tenga el cupo habilitado.
        obtenerIntegranteConAcceso(idAlumno, idClase);

        Alumno alumno = alumnoRepository.findById(idAlumno)
                .orElseThrow(() -> new RuntimeException("El alumno no existe"));
        Clase clase = claseRepository.findById(idClase)
                .orElseThrow(() -> new RuntimeException("La clase no existe"));

        int creditos = alumno.getCreditos() == null ? 0 : alumno.getCreditos();
        if (creditos <= 0) {
            throw new RuntimeException("No tenés créditos disponibles");
        }

        // Inscribir honrando el cupo que la lista de espera reservó para este alumno.
        // Devuelve false si por algún motivo ya no hay lugar; en ese caso NO se
        // descuenta el crédito y se informa el error (el alumno sigue en la cola).
        boolean inscripto = pagoService.inscribirDesdeEspera(clase, alumno);
        if (!inscripto) {
            throw new RuntimeException("El cupo ya no está disponible para esta clase");
        }

        // Recién con la inscripción confirmada descontamos el crédito y registramos el pago.
        alumno.setCreditos(creditos - 1);
        alumnoRepository.save(alumno);

        Pago pago = new Pago();
        pago.setAlumno(alumno);
        pago.setClase(clase);
        pago.setFecha(LocalDate.now());
        pago.setTipoPago(Pago.TipoPago.CREDITOS);
        pago.setTipo(Pago.TipoClase.INDIVIDUAL);
        pago.setValor(0.0);
        pago.setEstado(Pago.EstadoPago.COMPLETADO);
        pago.setDescripcion("Inscripción con crédito (lista de espera)");
        pagoRepository.save(pago);

        return new InscripcionResponseConfirmacion("Inscripción confirmada con crédito");
    }

    // Valida que el alumno tenga acceso habilitado para confirmar esta clase
    public void validarAccesoParaPago(int idAlumno, int idClase) {
        obtenerIntegranteConAcceso(idAlumno, idClase);
    }

    // ============================================================
    // 3b. RECHAZAR EL CUPO (declinar el lugar ofrecido desde la espera)
    // ============================================================
    // El alumno con acceso habilitado decide no ir: sale de la cola y el cupo
    // se ofrece de inmediato al siguiente de la lista (sin esperar). No genera
    // strike: declinar un cupo ofrecido no es cancelar una inscripción.
    @Transactional
    public String rechazarCupo(int idAlumno, int idClase) {
        EsperaAlumno integrante = obtenerIntegranteConAcceso(idAlumno, idClase);

        // Sale de la cola. El integrante se cargó a través de la colección del padre
        // (ListaEspera.integrantes, con cascade=ALL + orphanRemoval=true), así que un
        // esperaAlumnoRepository.delete() suelto quedaría anulado por el cascade del
        // padre al hacer flush. Hay que sacarlo de la colección para que orphanRemoval
        // borre efectivamente la fila. El lugar físico en la clase ya estaba libre.
        ListaEspera lista = integrante.getListaEspera();
        lista.getIntegrantes().remove(integrante);
        listaEsperaRepository.save(lista);

        // Se ofrece el cupo al primero sin acceso (habilitar + mail). El que rechaza
        // ya salió de la colección, así que queda excluido.
        boolean huboNotificado = habilitarPrimeroDeLaCola(idClase);

        if (huboNotificado) {
            return "Rechazaste el cupo. Se ofreció al siguiente de la lista de espera.";
        }
        return "Rechazaste el cupo.";
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

        boolean esAbono = esInscripcionPorAbono(idAlumno, idClase);

        // Umbral de anticipación para no recibir strike: 48hs abono mensual / 24hs individual
        int umbralHoras = esAbono ? 48 : 24;
        LocalDateTime inicioClase = clase.getFecha().atTime(clase.getHora() == null ? 0 : clase.getHora(), 0);
        boolean aTiempo = !LocalDateTime.now().plusHours(umbralHoras).isAfter(inicioClase);

        String mensaje;
        if (aTiempo) {
            if (esAbono) {
                // Abono a tiempo → se acredita 1 crédito
                int creditos = alumno.getCreditos() == null ? 0 : alumno.getCreditos();
                alumno.setCreditos(creditos + 1);
                alumnoRepository.save(alumno);
                mensaje = "Te diste de baja con éxito. Se te acreditó 1 crédito.";
            } else {
                // Individual a tiempo → email para gestionar la devolución del dinero
                alumnoRepository.save(alumno);
                emailService.notificarReembolsoIndividual(
                        alumno.getEmail(), alumno.getNombre(), descripcionClase(clase));
                mensaje = "Te diste de baja con éxito. Te enviamos un correo para gestionar la devolución de tu pago con la administración del gimnasio.";
            }
        } else {
            // Canceló tarde → strike
            int strikes = (alumno.getStrikes() == null ? 0 : alumno.getStrikes()) + 1;
            alumno.setStrikes(strikes);
            alumnoRepository.save(alumno);

            if (strikes >= STRIKES_LIMITE) {
                mensaje = "Te diste de baja con éxito. Acumulaste " + strikes + " strikes este mes, "
                        + "por lo que perdés el 20% de descuento del mes que viene.";
            } else {
                mensaje = "Te diste de baja con éxito. Tenés " + strikes + " de " + STRIKES_LIMITE
                        + " strikes este mes; al llegar a " + STRIKES_LIMITE + " perdés el 20% de descuento del mes que viene.";
            }
        }

        // Se liberó un cupo → habilitar al primero de la cola de espera (si hay)
        boolean huboNotificado = habilitarPrimeroDeLaCola(idClase);

        if (huboNotificado) {
            return mensaje + " Se notificó al primer alumno de la lista de espera.";
        }
        return mensaje;
    }

    // Determina si la inscripción del alumno a esa clase fue por abono mensual o individual.
    // Busca el pago de esa clase puntual; si no hay (caso típico de las clases del abono que no
    // son la "elegida"), se considera abono si el alumno tiene algún pago ABONADO completado.
    private boolean esInscripcionPorAbono(int idAlumno, int idClase) {
        boolean tienePagoIndividualDeLaClase = pagoRepository
                .findByAlumno_IdAndClase_IdClase(idAlumno, idClase).stream()
                .anyMatch(p -> p.getEstado() == Pago.EstadoPago.COMPLETADO
                        && p.getTipo() == Pago.TipoClase.INDIVIDUAL);
        if (tienePagoIndividualDeLaClase) {
            return false;
        }

        boolean tienePagoAbonoDeLaClase = pagoRepository
                .findByAlumno_IdAndClase_IdClase(idAlumno, idClase).stream()
                .anyMatch(p -> p.getEstado() == Pago.EstadoPago.COMPLETADO
                        && p.getTipo() == Pago.TipoClase.ABONADO);
        if (tienePagoAbonoDeLaClase) {
            return true;
        }

        // No hay pago directo de esta clase → si tiene un abono completado, es por abono
        return pagoRepository.findByAlumnoId(idAlumno).stream()
                .anyMatch(p -> p.getEstado() == Pago.EstadoPago.COMPLETADO
                        && p.getTipo() == Pago.TipoClase.ABONADO);
    }

    private String descripcionClase(Clase clase) {
        return nombreActividad(clase) + " " + clase.getFecha()
                + " " + (clase.getHora() == null ? "" : clase.getHora() + ":00");
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
                ? clase.getActividad().getTipo()
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
