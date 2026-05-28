package com.sportify.backend.services;

import java.time.LocalDate;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sportify.backend.dtos.PagoRequest;
import com.sportify.backend.dtos.PagoResponse;
import com.sportify.backend.entities.Pago;

@Service
public class TarjetaCreditoService {

    @Autowired
    private PagoService pagoService;

    public PagoResponse procesarPago(Pago pago, PagoRequest solicitud) {
        try {
            validarTarjeta(solicitud);
            String idTransaccion = procesarPagoConBanco(solicitud);
            pagoService.actualizarEstadoPago(pago.getIdPago(), Pago.EstadoPago.COMPLETADO, idTransaccion);
            return new PagoResponse(
                    pago.getIdPago(),
                    Pago.EstadoPago.COMPLETADO,
                    idTransaccion,
                    pago.getValor(),
                    "Pago con tarjeta procesado correctamente",
                    null);
        } catch (Exception e) {
            pagoService.actualizarEstadoPago(pago.getIdPago(), Pago.EstadoPago.FALLIDO, null);
            throw new RuntimeException(e.getMessage());
        }
    }

    private void validarTarjeta(PagoRequest solicitud) {
        if (solicitud.getNombreTitular() == null || solicitud.getNombreTitular().isEmpty()) {
            throw new RuntimeException("error por nombre del titular requerido");
        }
        if (!esFechaVencimientoValida(solicitud.getFechaVencimiento())) {
            throw new RuntimeException("error por fecha de vencimiento inválida");
        }
        if (!esCvvValido(solicitud.getCvv())) {
            throw new RuntimeException("error por CVV inválido");
        }

        // Bypass de Luhn para pruebas de desarrollo
        String nombre = solicitud.getNombreTitular().toUpperCase();
        if (nombre.equals("APRO") || nombre.equals("CONT") || nombre.equals("CALL")) {
            return;
        }

        if (!esNumeroTarjetaValido(solicitud.getNumeroTarjeta())) {
            throw new RuntimeException("Error por número de tarjeta inexistente");
        }
    }

    private String procesarPagoConBanco(PagoRequest solicitud) {
        String numero = solicitud.getNumeroTarjeta().replaceAll("\\s+", "");
        String nombre = solicitud.getNombreTitular().toUpperCase();

        // Simulaciones basadas en el nombre del titular (para pruebas)
        if (nombre.equals("CONT")) {
            throw new RuntimeException("Error por fondos insuficientes");
        }
        if (nombre.equals("CALL")) {
            throw new RuntimeException("Error por autorización rechazada");
        }

        // CVV de prueba para simular CVV inválido
        if (solicitud.getCvv().equals("000")) {
            throw new RuntimeException("Error por CVV inválido");
        }

        // Tarjetas de prueba tradicionales para simular respuestas del banco
        if (numero.equals("4000000000000002")) {
            throw new RuntimeException("Error por fondos insuficientes");
        }
        if (numero.equals("4000000000000119")) {
            throw new RuntimeException("Error por conexión no establecida");
        }

        return "TARJETA_" + UUID.randomUUID().toString();
    }

    private boolean esNumeroTarjetaValido(String numero) {
        if (numero == null || numero.isEmpty())
            return false;
        numero = numero.replaceAll("\\s+", "");
        if (!Pattern.matches("\\d{13,19}", numero))
            return false;

        int suma = 0;
        boolean alternar = false;
        for (int i = numero.length() - 1; i >= 0; i--) {
            int digito = Character.getNumericValue(numero.charAt(i));
            if (alternar) {
                digito *= 2;
                if (digito > 9)
                    digito -= 9;
            }
            suma += digito;
            alternar = !alternar;
        }
        return suma % 10 == 0;
    }

    private boolean esFechaVencimientoValida(String fecha) {
        if (fecha == null || !fecha.matches("\\d{2}/\\d{2}"))
            return false;

        int mes = Integer.parseInt(fecha.split("/")[0]);
        int anio = 2000 + Integer.parseInt(fecha.split("/")[1]);

        if (mes < 1 || mes > 12)
            return false;

        LocalDate hoy = LocalDate.now();
        LocalDate vencimiento = LocalDate.of(anio, mes, 1).plusMonths(1).minusDays(1);

        return !vencimiento.isBefore(hoy);
    }

    private boolean esCvvValido(String cvv) {
        return cvv != null && cvv.matches("\\d{3,4}");
    }
}