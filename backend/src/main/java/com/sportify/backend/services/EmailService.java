package com.sportify.backend.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Servicio de email MOCK. Por ahora no envía correos reales: loguea el contenido
 * en la consola del backend. Cuando se integre un SMTP real, solo hay que
 * reemplazar la implementación de estos métodos.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    public void notificarCupoLiberado(String emailDestino, String nombreAlumno, String descripcionClase) {
        log.info("========================= [MOCK EMAIL] =========================");
        log.info("Para: {}", emailDestino);
        log.info("Asunto: ¡Se liberó un cupo en tu clase en espera!");
        log.info("Hola {}, se liberó un cupo en \"{}\". Ya podés confirmar tu asistencia desde la app.",
                nombreAlumno, descripcionClase);
        log.info("===============================================================");
    }

    public void notificarReembolsoIndividual(String emailDestino, String nombreAlumno, String descripcionClase) {
        log.info("========================= [MOCK EMAIL] =========================");
        log.info("Para: {}", emailDestino);
        log.info("Asunto: Devolución de tu pago");
        log.info("Hola {}, diste de baja tu inscripción a \"{}\". Para la devolución de tu pago, "
                + "contactate con la administración del gimnasio.", nombreAlumno, descripcionClase);
        log.info("===============================================================");
    }
}
