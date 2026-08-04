package com.sportify.backend.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Envío de correos vía SMTP (Resend). Si app.mail.enabled=false, o si el envío
 * falla, solo se loguea el contenido y NO se corta el flujo principal
 * (la inscripción/cancelación/registro no dependen del correo).
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String from;
    private final boolean enabled;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.mail.from:sportify@euphra.tech}") String from,
                        @Value("${app.mail.enabled:true}") boolean enabled) {
        this.mailSender = mailSender;
        this.from = from;
        this.enabled = enabled;
    }

    // ============================================================
    // Correos del sistema
    // ============================================================

    public void notificarCupoLiberado(String emailDestino, String nombreAlumno, String descripcionClase) {
        String asunto = "¡Se liberó un cupo en tu clase en espera!";
        String cuerpo = String.format(
                "Hola %s,\n\nSe liberó un cupo en \"%s\". Ya podés confirmar tu asistencia desde la app.\n\n— Sportify",
                nombreAlumno, descripcionClase);
        enviar(emailDestino, asunto, cuerpo);
    }

    public void notificarReembolsoIndividual(String emailDestino, String nombreAlumno, String descripcionClase) {
        String asunto = "Devolución de tu pago";
        String cuerpo = String.format(
                "Hola %s,\n\nDiste de baja tu inscripción a \"%s\". Para la devolución de tu pago, "
                        + "contactate con la administración del gimnasio.\n\n— Sportify",
                nombreAlumno, descripcionClase);
        enviar(emailDestino, asunto, cuerpo);
    }

    public void notificarClaseCancelada(String emailDestino, String nombreAlumno, String descripcionClase, String motivo) {
        String asunto = "Tu clase fue cancelada";
        String cuerpo = String.format(
                "Hola %s,\n\nLamentamos informarte que la clase \"%s\" fue cancelada. Motivo: %s. "
                        + "Se te acreditó 1 crédito para que puedas inscribirte a otra clase.\n\n— Sportify",
                nombreAlumno, descripcionClase, motivo);
        enviar(emailDestino, asunto, cuerpo);
    }

    public void notificarRegistroProfesor(String emailDestino, String nombreProfesor, String passwordInicial) {
        String asunto = "Fuiste registrado como profesor en Sportify";
        String cuerpo = String.format(
                "Hola %s,\n\nFuiste registrado como profesor en Sportify.\n"
                        + "Ingresá con estos datos:\n  Email: %s\n  Contraseña inicial: tu DNI (%s)\n\n"
                        + "Te recomendamos cambiar la contraseña al ingresar.\n\n— Sportify",
                nombreProfesor, emailDestino, passwordInicial);
        enviar(emailDestino, asunto, cuerpo);
    }

    // ============================================================
    // Envío genérico (async + tolerante a fallos)
    // ============================================================
    @Async
    public void enviar(String destino, String asunto, String cuerpo) {
        if (!enabled) {
            log.info("[MAIL DESHABILITADO] Para: {} | Asunto: {}\n{}", destino, asunto, cuerpo);
            return;
        }
        if (destino == null || destino.isBlank()) {
            log.warn("[MAIL] Destino vacío, no se envía. Asunto: {}", asunto);
            return;
        }
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(from);
            mensaje.setTo(destino);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpo);
            mailSender.send(mensaje);
            log.info("[MAIL] Enviado a {} | Asunto: {}", destino, asunto);
        } catch (Exception e) {
            // No romper el flujo principal si el correo falla.
            log.error("[MAIL] Error enviando a {} | Asunto: {} | {}", destino, asunto, e.getMessage());
        }
    }
}
