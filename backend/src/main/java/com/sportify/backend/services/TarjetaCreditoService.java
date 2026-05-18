package com.sportify.backend.services;

import com.sportify.backend.entities.Pago;
import com.sportify.backend.dtos.PagoRequest;
import com.sportify.backend.dtos.PagoResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class TarjetaCreditoService {

    @Autowired
    private PagoService pagoService;

    public PagoResponse procesarPago(Pago pago, PagoRequest solicitud) {
        try {
            validarTarjeta(solicitud);

            String idTransaccion = procesarPagoTarjeta(solicitud);

            pagoService.actualizarEstadoPago(
                    pago.getIdPago(),
                    Pago.EstadoPago.COMPLETADO,
                    idTransaccion
            );

            return new PagoResponse(
                    pago.getIdPago(),
                    Pago.EstadoPago.COMPLETADO,
                    idTransaccion,
                    pago.getValor(),
                    "Pago con tarjeta procesado correctamente",
                    null
            );

        } catch (Exception e) {
            pagoService.actualizarEstadoPago(
                    pago.getIdPago(),
                    Pago.EstadoPago.FALLIDO,
                    null
            );
            throw new RuntimeException("Error procesando tarjeta: " + e.getMessage());
        }
    }

    private void validarTarjeta(PagoRequest solicitud) {
        if (!esNumeroTarjetaValido(solicitud.getNumeroTarjeta())) {
            throw new RuntimeException("Número de tarjeta inválido");
        }

        if (!esFechaVencimientoValida(solicitud.getFechaVencimiento())) {
            throw new RuntimeException("Fecha de vencimiento inválida");
        }

        if (!esCvvValido(solicitud.getCvv())) {
            throw new RuntimeException("CVV inválido");
        }

        if (solicitud.getNombreTitular() == null || solicitud.getNombreTitular().isEmpty()) {
            throw new RuntimeException("Nombre del titular requerido");
        }
    }

    private boolean esNumeroTarjetaValido(String numero) {
        if (numero == null || numero.isEmpty()) {
            return false;
        }

        numero = numero.replaceAll("\\s+", "");

        if (!Pattern.matches("\\d{13,19}", numero)) {
            return false;
        }

        int suma = 0;
        boolean alternar = false;

        for (int i = numero.length() - 1; i >= 0; i--) {
            int digito = Character.getNumericValue(numero.charAt(i));

            if (alternar) {
                digito *= 2;
                if (digito > 9) {
                    digito -= 9;
                }
            }

            suma += digito;
            alternar = !alternar;
        }

        return suma % 10 == 0;
    }

    private boolean esFechaVencimientoValida(String fecha) {
        if (fecha == null || !fecha.matches("\\d{2}/\\d{2}")) {
            return false;
        }

        String[] partes = fecha.split("/");
        int mes = Integer.parseInt(partes[0]);

        if (mes < 1 || mes > 12) {
            return false;
        }

        return true;
    }

    private boolean esCvvValido(String cvv) {
        return cvv != null && cvv.matches("\\d{3,4}");
    }

    private String procesarPagoTarjeta(PagoRequest solicitud) {
        return "TARJETA_" + UUID.randomUUID().toString();
    }
}